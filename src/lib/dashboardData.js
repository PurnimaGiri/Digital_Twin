
import { supabase } from './supabase';

const TELEMETRY_PAGE_SIZE = 1000;

// Fetch the newest telemetry row for every requested room.
async function fetchLatestReadings(roomIds = []) {
  if (!roomIds.length) return [];

  const latestByRoom = new Map();
  let from = 0;

  while (latestByRoom.size < roomIds.length) {
    const to = from + TELEMETRY_PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('telemetry_readings')
      .select('id, room_id, occupancy, temperature, humidity, co2, energy_kw, recorded_at')
      .in('room_id', roomIds)
      .order('recorded_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    if (!data?.length) break;

    for (const reading of data) {
      if (!latestByRoom.has(reading.room_id)) {
        latestByRoom.set(reading.room_id, reading);
      }
    }

    if (data.length < TELEMETRY_PAGE_SIZE) break;
    from += TELEMETRY_PAGE_SIZE;
  }

  return Array.from(latestByRoom.values());
}

// Fetch buildings, floors and rooms.
async function fetchBuildingStructure(buildingCode = 'All') {
  const { data: buildings, error: buildingError } = await supabase
    .from('buildings')
    .select('id, name, code, description');

  if (buildingError) throw buildingError;

  const allBuildings = buildings || [];

  const selectedBuildings =
    buildingCode && buildingCode !== 'All'
      ? allBuildings.filter((building) => building.code === buildingCode)
      : allBuildings;

  const buildingIds = selectedBuildings.map((building) => building.id);

  if (!buildingIds.length) {
    return { buildings: [], floors: [], rooms: [] };
  }

  const { data: floors, error: floorError } = await supabase
    .from('Floors')
    .select('id, building_id, floor_number, name')
    .in('building_id', buildingIds)
    .order('floor_number');

  if (floorError) throw floorError;

  const floorIds = (floors || []).map((floor) => floor.id);

  if (!floorIds.length) {
    return { buildings: selectedBuildings, floors: [], rooms: [] };
  }

  const { data: rooms, error: roomError } = await supabase
    .from('Rooms')
    .select('id, floor_id, room_no, capacity')
    .in('floor_id', floorIds)
    .order('id');

  if (roomError) throw roomError;

  return {
    buildings: selectedBuildings,
    floors: floors || [],
    rooms: rooms || [],
  };
}

/**
 * Campus-wide KPIs and individual building snapshots.
 * The dashboard KPIs always include all buildings.
 */
export async function fetchDashboardMetrics() {
  try {
    const { buildings, floors, rooms } =
      await fetchBuildingStructure('All');

    const roomIds = rooms.map((room) => room.id);
    const readings = await fetchLatestReadings(roomIds);

    const totalOccupants = readings.reduce(
      (sum, reading) => sum + Number(reading.occupancy || 0),
      0
    );

    const totalPower = readings.reduce(
      (sum, reading) => sum + Number(reading.energy_kw || 0),
      0
    );

    const average = (field) =>
      readings.length
        ? readings.reduce(
            (sum, reading) => sum + Number(reading[field] || 0),
            0
          ) / readings.length
        : 0;

    const latestReadingByRoom = new Map(
      readings.map((reading) => [reading.room_id, reading])
    );

    const { count: activeAlertsCount, error: alertError } =
      await supabase
        .from('alerts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

    if (alertError) throw alertError;

    // Calculate metrics for each building.
    const buildingSnapshots = buildings.map((building) => {
      const buildingFloorIds = floors
        .filter((floor) => floor.building_id === building.id)
        .map((floor) => floor.id);

      const buildingRooms = rooms.filter((room) =>
        buildingFloorIds.includes(room.floor_id)
      );

      const buildingReadings = buildingRooms
        .map((room) => latestReadingByRoom.get(room.id))
        .filter(Boolean);

      const occupants = buildingReadings.reduce(
        (sum, reading) => sum + Number(reading.occupancy || 0),
        0
      );

      const powerKw = buildingReadings.reduce(
        (sum, reading) => sum + Number(reading.energy_kw || 0),
        0
      );

      const capacity = buildingRooms.reduce(
        (sum, room) => sum + Number(room.capacity || 0),
        0
      );

      return {
        id: building.id,
        code: building.code,
        name: building.name,
        totalRooms: buildingRooms.length,
        roomsReporting: buildingReadings.length,
        totalFloors: buildingFloorIds.length,
        occupants,
        powerKw: powerKw.toFixed(1),
        occupancyPct: capacity
          ? Math.round((occupants / capacity) * 100)
          : 0,
      };
    });

    const latestTimestamp = readings.reduce((latest, reading) => {
      if (!reading.recorded_at) return latest;

      if (
        !latest ||
        new Date(reading.recorded_at) > new Date(latest)
      ) {
        return reading.recorded_at;
      }

      return latest;
    }, null);

    const totalPowerKw = Number(totalPower.toFixed(1));

    return {
      totalPowerKw: totalPowerKw.toFixed(1),

      // Estimated 24-hour energy, not actual metered energy.
      estimatedDailyEnergyKwh: (totalPowerKw * 24).toFixed(0),

      totalOccupants,

      activeRooms: readings.filter(
        (reading) => Number(reading.occupancy) > 0
      ).length,

      avgTemp: average('temperature').toFixed(1),
      avgHumidity: average('humidity').toFixed(1),
      avgCO2: Math.round(average('co2')),

      activeAlertsCount: activeAlertsCount || 0,

      totalRooms: rooms.length,
      roomsReporting: readings.length,

      telemetryCoverage: rooms.length
        ? Math.round((readings.length / rooms.length) * 100)
        : 0,

      latestReadingAt: latestTimestamp,
      buildingSnapshots,
    };
  } catch (error) {
    console.error('Error in fetchDashboardMetrics:', error);
    return null;
  }
}


/**
 * Fetch historical dashboard metrics from Supabase.
 * Supported periods: 24 hours, 7 days and 30 days.
 */
export async function fetchPeriodMetrics(hours = 24) {
  try {
    const { data, error } = await supabase.rpc(
      'get_dashboard_period_metrics',
      { p_hours: hours }
    );

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching period metrics:', error);
    return null;
  }
}

/**
 * Building Explorer: floors, rooms and latest telemetry.
 */
export async function getBuildingSnapshot(buildingCode = 'SVH') {
  try {
    const { buildings, floors, rooms } =
      await fetchBuildingStructure(buildingCode);

    const building = buildings[0];

    if (!building) {
      throw new Error(`Building ${buildingCode} not found`);
    }

    const readings = await fetchLatestReadings(
      rooms.map((room) => room.id)
    );

    const latestByRoom = new Map(
      readings.map((reading) => [reading.room_id, reading])
    );

    const enrichedRooms = rooms.map((room) => {
      const floor = floors.find(
        (item) => item.id === room.floor_id
      );

      return {
        ...room,
        name: room.room_no,
        room_number: room.room_no,

        latestReading: latestByRoom.get(room.id) || {
          occupancy: 0,
          temperature: 0,
          humidity: 0,
          co2: 0,
          energy_kw: 0,
          recorded_at: null,
        },

        floor,
      };
    });

    return {
      building,
      floors,
      rooms: enrichedRooms,
    };
  } catch (error) {
    console.error('Error in getBuildingSnapshot:', error);
    return null;
  }
}

/**
 * Supabase Realtime telemetry listener.
 */
export function subscribeToTelemetry(onNewReading) {
  return supabase
    .channel('global_telemetry')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'telemetry_readings',
      },
      (payload) => {
        if (typeof onNewReading === 'function') {
          onNewReading(payload);
        }
      }
    )
    .subscribe();
}

// Fetch room, floor and building locations for operational records.
async function fetchRoomLocations(roomIds) {
  if (!roomIds.length) {
    return {
      rooms: [],
      floors: [],
      buildings: [],
    };
  }

  const { data: rooms, error: roomError } = await supabase
    .from('Rooms')
    .select('id, room_no, floor_id')
    .in('id', roomIds);

  if (roomError) throw roomError;

  const floorIds = [
    ...new Set((rooms || []).map((room) => room.floor_id)),
  ];

  if (!floorIds.length) {
    return {
      rooms: rooms || [],
      floors: [],
      buildings: [],
    };
  }

  const { data: floors, error: floorError } = await supabase
    .from('Floors')
    .select('id, name, building_id')
    .in('id', floorIds);

  if (floorError) throw floorError;

  const buildingIds = [
    ...new Set((floors || []).map((floor) => floor.building_id)),
  ];

  const { data: buildings, error: buildingError } = await supabase
    .from('buildings')
    .select('id, name, code')
    .in('id', buildingIds);

  if (buildingError) throw buildingError;

  return {
    rooms: rooms || [],
    floors: floors || [],
    buildings: buildings || [],
  };
}

function attachLocation(record, locationData) {
  const room = locationData.rooms.find(
    (item) => item.id === record.room_id
  );

  const floor = locationData.floors.find(
    (item) => item.id === room?.floor_id
  );

  const building = locationData.buildings.find(
    (item) => item.id === floor?.building_id
  );

  return {
    ...record,
    code: record.alert_type || record.id,

    rooms: room
      ? {
          name: room.room_no,
          room_number: room.room_no,

          floors: floor
            ? {
                name: floor.name,
                buildings: building || null,
              }
            : null,
        }
      : null,
  };
}

/**
 * Fetch active and acknowledged alerts.
 */
export async function fetchActiveAlerts() {
  try {
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select(
        'id, room_id, alert_type, severity, message, status, created_at'
      )
      .in('status', ['active', 'acknowledged'])
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    const locations = await fetchRoomLocations(
      [
        ...new Set(
          (alerts || [])
            .map((alert) => alert.room_id)
            .filter(Boolean)
        ),
      ]
    );

    return (alerts || []).map((alert) =>
      attachLocation(alert, locations)
    );
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

/**
 * Fetch recommendations with building and room information.
 */
export async function fetchRecommendations() {
  try {
    const { data: recommendations, error } = await supabase
      .from('recommendations')
      .select(
        'id, room_id, title, description, recommendation_type, priority, status, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    const locations = await fetchRoomLocations(
      [
        ...new Set(
          (recommendations || [])
            .map((item) => item.room_id)
            .filter(Boolean)
        ),
      ]
    );

    return (recommendations || []).map((item) =>
      attachLocation(item, locations)
    );
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
}
