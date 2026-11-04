import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import {
  Building2,
  Layers,
  Eye,
  EyeOff,
  Activity,
  Zap,
  Wind,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { getBuildingSnapshot, subscribeToTelemetry } from '../lib/dashboardData';

const BUILDING_CODES = ['SVH', 'ENG', 'LAW'];

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'No readings';
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  );
  if (seconds < 60) return `${seconds} sec ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  return `${Math.floor(seconds / 3600)} hr ago`;
}

function getRoomStatus(room) {
  const reading = room.latestReading || {};
  const occupancy = Number(reading.occupancy || 0);
  const co2 = Number(reading.co2_level || reading.co2 || 0);

  if (co2 > 1200) {
    return { label: 'Critical', color: 'red' };
  }
  if (co2 > 1000) {
    return { label: 'Warning', color: 'amber' };
  }
  if (occupancy > 0) {
    return { label: 'Occupied', color: 'green' };
  }
  return { label: 'Available', color: 'green' };
}

function getBuildingStats(rooms = []) {
  const validRooms = rooms.filter((room) => room.latestReading);
  const occupancy = validRooms.reduce(
    (sum, room) => sum + Number(room.latestReading.occupancy || 0),
    0
  );
  const power = validRooms.reduce(
    (sum, room) =>
      sum + Number(room.latestReading.power_kw || room.latestReading.energy_kw || 0),
    0
  );
  const capacity = rooms.reduce(
    (sum, room) => sum + Number(room.capacity || 0),
    0
  );
  return {
    occupancy,
    power,
    occupancyPct: capacity ? Math.round((occupancy / capacity) * 100) : 0,
  };
}

function DetailedBuilding({
  position,
  size,
  isSelected,
  onClick,
  baseColor = '#94a3b8',
  floorsCount = 2,
}) {
  const [w, h, d] = size;
  const glassColor = isSelected ? '#60a5fa' : '#38bdf8';
  const mainColor = isSelected ? '#2563eb' : baseColor;

  return (
    <group position={position} onClick={onClick}>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={mainColor} roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, h + 0.1, 0]} castShadow>
        <boxGeometry args={[w + 0.2, 0.2, d + 0.2]} />
        <meshStandardMaterial color="#334155" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[w + 0.3, 0.2, d + 0.3]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      {Array.from({ length: Math.max(1, floorsCount) }).map((_, index) => {
        const floorY = (h / Math.max(1, floorsCount)) * (index + 0.5);
        return (
          <group key={index} position={[0, floorY, 0]}>
            <mesh position={[0, 0, d / 2 + 0.02]}>
              <planeGeometry args={[w * 0.85, (h / floorsCount) * 0.5]} />
              <meshStandardMaterial
                color={glassColor}
                roughness={0.1}
                metalness={0.8}
                transparent
                opacity={0.85}
              />
            </mesh>
            <mesh position={[0, 0, -d / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[w * 0.85, (h / floorsCount) * 0.5]} />
              <meshStandardMaterial
                color={glassColor}
                roughness={0.1}
                metalness={0.8}
                transparent
                opacity={0.85}
              />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 0.4, d / 2 + 0.4]} castShadow>
        <boxGeometry args={[w * 0.3, 0.1, 0.8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

function FloatingTag({ position, name, stats, isSelected, onClick, isAlert = false }) {
  return (
    <Html
      position={position}
      center
      distanceFactor={24}
      occlude={false}
      zIndexRange={[1000, 0]}
      style={{ pointerEvents: 'auto' }}
    >
      <button
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        type="button"
        className={`px-3.5 py-2 rounded-2xl text-xs font-semibold shadow-2xl transition-all border whitespace-nowrap cursor-pointer select-none flex items-center gap-2.5 ${
          isSelected
            ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-500/20 scale-105'
            : 'bg-white/95 backdrop-blur-md text-slate-800 border-slate-200 hover:bg-slate-50'
        }`}
      >
        {isAlert && (
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
        )}
        <div className="text-left">
          <div className="font-bold text-xs leading-tight">{name}</div>
          <div
            className={`text-[10px] font-medium mt-0.5 ${
              isSelected ? 'text-blue-100' : 'text-slate-500'
            }`}
          >
            {stats}
          </div>
        </div>
      </button>
    </Html>
  );
}

function RealisticTree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 1, 8]} />
        <meshStandardMaterial color="#54382b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <coneGeometry args={[0.7, 1.2, 8]} />
        <meshStandardMaterial color="#16a34a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <coneGeometry args={[0.5, 1.0, 8]} />
        <meshStandardMaterial color="#22c55e" roughness={0.5} />
      </mesh>
    </group>
  );
}

function CampusGround() {
  return (
    <group position={[0, -0.05, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[14, 45]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[45, 14]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function BuildingView({
  onNavigateToDashboard,
  selectedBuilding = 'SVH',
  setSelectedBuilding,
}) {
  const activeBuilding = selectedBuilding === 'All' ? 'SVH' : selectedBuilding;
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [activeTab, setActiveTab] = useState('3D Campus');
  const [isLayersOpen, setIsLayersOpen] = useState(true);
  const [buildingData, setBuildingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [layers, setLayers] = useState({
    buildings: true,
    occupancy: true,
    energyNetwork: false,
    environmental: false,
    alerts: true,
  });

  const loadBuilding = useCallback(async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      setDataError(null);
      const result = await getBuildingSnapshot(activeBuilding);
      if (!result) {
        throw new Error('Unable to load building information.');
      }
      setBuildingData(result);
      setLastUpdated(new Date());

      const floors = result.floors || [];
      const rooms = result.rooms || [];

      setSelectedFloorId((previous) => {
        const exists = floors.some((floor) => floor.id === previous);
        return exists ? previous : floors[0]?.id ?? null;
      });

      setSelectedRoomId((previous) => {
        const exists = rooms.some((room) => room.id === previous);
        return exists ? previous : rooms[0]?.id ?? null;
      });
    } catch (error) {
      console.error('Building Explorer error:', error);
      setDataError(error.message || 'Failed to load building data.');
    } finally {
      setIsLoading(false);
    }
  }, [activeBuilding]);

  useEffect(() => {
    loadBuilding(true);
  }, [loadBuilding]);

  useEffect(() => {
    const subscription = subscribeToTelemetry(() => {
      loadBuilding(false);
    });
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [loadBuilding]);

  const building = buildingData?.building || null;
  const floors = buildingData?.floors || [];
  const rooms = buildingData?.rooms || [];

  const currentFloor = floors.find((floor) => floor.id === selectedFloorId) || floors[0] || null;

  const currentFloorRooms = useMemo(() => {
    if (!currentFloor) return [];
    return rooms.filter((room) => room.floor_id === currentFloor.id);
  }, [rooms, currentFloor]);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) || currentFloorRooms[0] || null;
  const roomReading = selectedRoom?.latestReading || {};
  const selectedRoomStatus = selectedRoom
    ? getRoomStatus(selectedRoom)
    : { label: 'No data', color: 'green' };

  const buildingStats = useMemo(() => getBuildingStats(rooms), [rooms]);

  const buildingLabel = {
    SVH: 'SVH',
    ENG: 'Engineering Block',
    LAW: 'Law Block',
  };

  const [campusStats, setCampusStats] = useState({});

  useEffect(() => {
    let cancelled = false;
    async function loadAllBuildings() {
      const results = await Promise.all(
        BUILDING_CODES.map(async (code) => {
          const result = await getBuildingSnapshot(code);
          if (!result) return null;
          return {
            code,
            name: result.building?.name,
            floorsCount: result.floors?.length || 0,
            roomsCount: result.rooms?.length || 0,
            ...getBuildingStats(result.rooms || []),
          };
        })
      );
      if (!cancelled) {
        const mapped = {};
        results.filter(Boolean).forEach((item) => {
          mapped[item.code] = item;
        });
        setCampusStats(mapped);
      }
    }
    loadAllBuildings();
    return () => {
      cancelled = true;
    };
  }, [lastUpdated]);

  const handleBuildingChange = (code) => {
    if (typeof setSelectedBuilding === 'function') {
      setSelectedBuilding(code);
    }
    setSelectedFloorId(null);
    setSelectedRoomId(null);
  };

  const handleFloorChange = (floor) => {
    setSelectedFloorId(floor.id);
    const firstRoom = rooms.find((room) => room.floor_id === floor.id);
    setSelectedRoomId(firstRoom?.id ?? null);
  };

  const toggleLayer = (key, event) => {
    if (event) event.stopPropagation();
    setLayers((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const activeLayerCount = Object.values(layers).filter(Boolean).length;

  const getRoomBorderColor = (room) => {
    const status = getRoomStatus(room);
    switch (status.color) {
      case 'amber':
        return 'border-amber-400 bg-amber-50/50 text-amber-900';
      case 'red':
        return 'border-red-500 bg-red-50/50 text-red-900';
      default:
        return room.latestReading?.occupancy > 0
          ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900'
          : 'border-slate-300 bg-white text-slate-700';
    }
  };

  const renderRoomCard = (room) => {
    const reading = room.latestReading || {};
    const status = getRoomStatus(room);
    const roomNo = room.room_number || room.room_no || room.name;

    return (
      <button
        key={room.id}
        onClick={() => setSelectedRoomId(room.id)}
        className={`p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${getRoomBorderColor(
          room
        )} ${
          selectedRoomId === room.id
            ? 'ring-2 ring-blue-500 scale-[1.02] shadow-md'
            : 'hover:shadow'
        }`}
      >
        <span className="text-[10px] font-bold tracking-wider uppercase opacity-75">
          ROOM
        </span>
        <span className="text-lg font-black">{roomNo}</span>
        <span className="text-xs font-semibold mt-1">
          {Number(reading.occupancy || 0) > 0
            ? `${reading.occupancy} people`
            : 'Available'}
        </span>
        <span className="text-[10px] mt-1 opacity-70">{status.label}</span>
      </button>
    );
  };

  if (isLoading && !buildingData) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-slate-50">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">
          Loading campus data from Supabase...
        </p>
      </div>
    );
  }

  if (dataError && !buildingData) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 bg-slate-50 p-6">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="text-sm text-red-600 text-center">{dataError}</p>
        <button
          onClick={() => loadBuilding(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 text-slate-900 overflow-hidden">
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-4">
        <div>
          <p className="text-[10px] sm:text-xs font-bold tracking-wider text-blue-600 uppercase mb-1">
            IILM UNIVERSITY • GREATER NOIDA
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Campus Spatial Overview
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Explore buildings, floors and room-level operating conditions.
              </p>
              <p className="text-[10px] text-amber-600 font-semibold mt-1">
                SIMULATED SENSOR DATA
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500">
                {lastUpdated
                  ? `Updated ${formatTimeAgo(lastUpdated.toISOString())}`
                  : 'Waiting for readings'}
              </span>
              <button
                onClick={() => loadBuilding(true)}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
                title="Refresh building data"
              >
                <RefreshCw
                  className={`w-4 h-4 text-blue-600 ${isLoading ? 'animate-spin' : ''}`}
                />
              </button>
              <div className="flex items-center bg-slate-200/80 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setActiveTab('3D Campus')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    activeTab === '3D Campus'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  3D Campus
                </button>
                <button
                  onClick={() => setActiveTab('Floor plan')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    activeTab === 'Floor plan'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  Floor plan
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[550px]">
          <div className="lg:col-span-3 relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden h-[550px] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 z-20 bg-white/90 backdrop-blur">
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={activeBuilding}
                  onChange={(event) => handleBuildingChange(event.target.value)}
                  className="appearance-none bg-slate-100 border border-slate-300 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="SVH">SVH</option>
                  <option value="ENG">Engineering Block</option>
                  <option value="LAW">Law Block</option>
                </select>
                {activeTab === 'Floor plan' && (
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
                    {floors.map((floor) => (
                      <button
                        key={floor.id}
                        onClick={() => handleFloorChange(floor)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                          currentFloor?.id === floor.id
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {floor.name || `Floor ${floor.floor_number}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 hidden sm:block">
                  {activeTab === '3D Campus'
                    ? 'Live spatial 3D architectural twin'
                    : 'Click a room to inspect telemetry'}
                </span>
                <span className="text-red-600 font-bold text-xs ml-2">N ↑</span>
              </div>
            </div>

            {activeTab === '3D Campus' ? (
              <div className="relative flex-1 bg-gradient-to-b from-[#f1f5f9] to-[#e2e8f0]">
                <Canvas
                  shadows
                  camera={{ position: [20, 20, 20], fov: 40 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <ambientLight intensity={0.7} />
                  <directionalLight
                    position={[25, 35, 25]}
                    intensity={1.3}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                  />
                  <pointLight position={[-15, 15, -15]} intensity={0.4} />
                  <Suspense fallback={null}>
                    <CampusGround />
                    {layers.buildings && (
                      <>
                        <DetailedBuilding
                          position={[-8, 0, -5]}
                          size={[4.5, 2.2, 3.2]}
                          floorsCount={campusStats.SVH?.floorsCount || 3}
                          baseColor={layers.environmental ? '#10b981' : '#64748b'}
                          isSelected={activeBuilding === 'SVH'}
                          onClick={() => handleBuildingChange('SVH')}
                        />
                        <FloatingTag
                          position={[-8, 3.0, -5]}
                          name="SVH"
                          stats={`${campusStats.SVH?.occupancyPct ?? 0}% occupied · ${(campusStats.SVH?.power || 0).toFixed(1)} kW`}
                          isSelected={activeBuilding === 'SVH'}
                          onClick={() => handleBuildingChange('SVH')}
                        />
                        <DetailedBuilding
                          position={[7, 0, -6]}
                          size={[5, 3.4, 3.5]}
                          floorsCount={campusStats.ENG?.floorsCount || 4}
                          baseColor={layers.environmental ? '#10b981' : '#475569'}
                          isSelected={activeBuilding === 'ENG'}
                          onClick={() => handleBuildingChange('ENG')}
                        />
                        <FloatingTag
                          position={[7, 4.2, -6]}
                          name="Engineering Block"
                          stats={`${campusStats.ENG?.occupancyPct ?? 0}% occupied · ${(campusStats.ENG?.power || 0).toFixed(1)} kW`}
                          isSelected={activeBuilding === 'ENG'}
                          onClick={() => handleBuildingChange('ENG')}
                        />
                        <DetailedBuilding
                          position={[0, 0, 8]}
                          size={[4.8, 2.6, 3]}
                          floorsCount={campusStats.LAW?.floorsCount || 4}
                          baseColor={layers.environmental ? '#10b981' : '#64748b'}
                          isSelected={activeBuilding === 'LAW'}
                          onClick={() => handleBuildingChange('LAW')}
                        />
                        <FloatingTag
                          position={[0, 3.2, 8]}
                          name="Law Block"
                          stats={`${campusStats.LAW?.occupancyPct ?? 0}% occupied · ${(campusStats.LAW?.power || 0).toFixed(1)} kW`}
                          isSelected={activeBuilding === 'LAW'}
                          onClick={() => handleBuildingChange('LAW')}
                        />
                      </>
                    )}
                    <RealisticTree position={[-13, 0, -2]} />
                    <RealisticTree position={[-12, 0, 4]} />
                    <RealisticTree position={[12, 0, -3]} />
                    <RealisticTree position={[8, 0, 5]} />
                    <RealisticTree position={[-4, 0, 11]} />
                    <RealisticTree position={[5, 0, 12]} />
                  </Suspense>
                  <OrbitControls
                    enableZoom
                    enableRotate
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2.25}
                    minDistance={12}
                    maxDistance={45}
                  />
                </Canvas>
                <div className="absolute bottom-4 left-4 z-30 bg-white/95 backdrop-blur rounded-2xl border border-slate-200/80 shadow-xl w-60 overflow-hidden select-none">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setIsLayersOpen(!isLayersOpen);
                    }}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50/80 border-b border-slate-100 cursor-pointer hover:bg-slate-100/80 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Visible layers
                      </span>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                        {activeLayerCount}
                      </span>
                    </div>
                    {isLayersOpen ? (
                      <Eye className="w-4 h-4 text-slate-400" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {isLayersOpen && (
                    <div className="p-3 space-y-2">
                      <LayerButton
                        icon={<Building2 className="w-4 h-4 text-slate-600" />}
                        label="3D Buildings"
                        active={layers.buildings}
                        color="blue"
                        onClick={(event) => toggleLayer('buildings', event)}
                      />
                      <LayerButton
                        icon={<Activity className="w-4 h-4 text-emerald-600" />}
                        label="Occupancy"
                        active={layers.occupancy}
                        color="emerald"
                        onClick={(event) => toggleLayer('occupancy', event)}
                      />
                      <LayerButton
                        icon={<Zap className="w-4 h-4 text-amber-500" />}
                        label="Energy Load"
                        active={layers.energyNetwork}
                        color="amber"
                        onClick={(event) => toggleLayer('energyNetwork', event)}
                      />
                      <LayerButton
                        icon={<Wind className="w-4 h-4 text-sky-500" />}
                        label="Indoor Climate"
                        active={layers.environmental}
                        color="sky"
                        onClick={(event) => toggleLayer('environmental', event)}
                      />
                      <LayerButton
                        icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
                        label="Active Alerts"
                        active={layers.alerts}
                        color="red"
                        onClick={(event) => toggleLayer('alerts', event)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 p-6 bg-slate-100/60 overflow-y-auto">
                {currentFloorRooms.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm">
                    No rooms found on this floor.
                  </p>
                ) : (
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {currentFloorRooms.slice(0, 4).map(renderRoomCard)}
                    </div>
                    <div className="bg-slate-200/80 rounded-xl py-2 text-center text-xs font-black tracking-widest text-slate-500 uppercase">
                      CENTRAL CORRIDOR
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {currentFloorRooms.slice(4, 8).map(renderRoomCard)}
                    </div>
                    {currentFloorRooms.length > 8 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                        {currentFloorRooms.slice(8).map(renderRoomCard)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            {!selectedRoom ? (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
                Select a room to view its details.
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {building?.name || buildingLabel[activeBuilding]}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {currentFloor?.name} · Room{' '}
                    {selectedRoom.room_number || selectedRoom.room_no || selectedRoom.name}
                  </p>
                </div>
                <div
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    selectedRoomStatus.color === 'red'
                      ? 'bg-red-50 border-red-200'
                      : selectedRoomStatus.color === 'amber'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                        selectedRoomStatus.color === 'red'
                          ? 'bg-red-500'
                          : selectedRoomStatus.color === 'amber'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="text-xs font-bold">
                      {selectedRoomStatus.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold">
                    {Number(roomReading.occupancy || 0)} occupants
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
                  <MetricCell
                    label="Temperature"
                    value={
                      roomReading.temperature != null
                        ? `${Number(roomReading.temperature).toFixed(1)} °C`
                        : 'No data'
                    }
                  />
                  <MetricCell
                    label="Humidity"
                    value={
                      roomReading.humidity != null
                        ? `${Number(roomReading.humidity).toFixed(1)}%`
                        : 'No data'
                    }
                  />
                  <MetricCell
                    label="CO₂"
                    value={
                      roomReading.co2_level != null || roomReading.co2 != null
                        ? `${roomReading.co2_level ?? roomReading.co2} ppm`
                        : 'No data'
                    }
                  />
                  <MetricCell
                    label="Active power"
                    value={
                      roomReading.power_kw != null || roomReading.energy_kw != null
                        ? `${Number(roomReading.power_kw ?? roomReading.energy_kw).toFixed(2)} kW`
                        : 'No data'
                    }
                  />
                  <MetricCell
                    label="Room capacity"
                    value={selectedRoom.capacity ?? 'Not set'}
                  />
                  <MetricCell label="Energy today" value="Not calculated" />
                  <MetricCell label="HVAC" value="Not monitored" />
                  <MetricCell label="Lighting" value="Not monitored" />
                  <MetricCell
                    label="Updated"
                    value={formatTimeAgo(roomReading.created_at || roomReading.recorded_at)}
                  />
                  <MetricCell label="Room ID" value={selectedRoom.id} />
                </div>
                <p className="text-[10px] text-slate-400">
                  Sensor readings are simulated and stored in Supabase.
                </p>
              </div>
            )}
            <button
              onClick={onNavigateToDashboard}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition cursor-pointer mt-6"
            >
              View building details
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard label="Total rooms" value={rooms.length} />
          <SummaryCard label="Total floors" value={floors.length} />
          <SummaryCard label="Current occupancy" value={buildingStats.occupancy} />
          <SummaryCard
            label="Current power load"
            value={`${buildingStats.power.toFixed(1)} kW`}
          />
        </div>
      </div>
    </div>
  );
}

function MetricCell({ label, value }) {
  return (
    <div className="bg-white p-3.5 min-w-0">
      <p className="text-[11px] text-slate-500 font-medium">{label}</p>
      <p className="text-base font-bold text-slate-900 mt-0.5 break-words">
        {value}
      </p>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function LayerButton({ icon, label, active, color, onClick }) {
  const colorClasses = {
    blue: active ? 'bg-blue-600' : 'bg-slate-300',
    emerald: active ? 'bg-emerald-600' : 'bg-slate-300',
    amber: active ? 'bg-amber-500' : 'bg-slate-300',
    sky: active ? 'bg-sky-500' : 'bg-slate-300',
    red: active ? 'bg-red-500' : 'bg-slate-300',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/80 transition cursor-pointer"
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-xs font-semibold text-slate-700">{label}</span>
      </div>
      <div
        className={`w-8 h-4 rounded-full transition-colors relative ${colorClasses[color]}`}
      >
        <div
          className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
            active ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}