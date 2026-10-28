import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import {
  Building2,
  ChevronDown,
  Layers,
  Eye,
  EyeOff,
  Activity,
  Zap,
  Wind,
  AlertTriangle,
} from 'lucide-react';

const CAMPUS_FLOOR_DATA = {
  SVH: {
    fullName: 'Sir Vivekanand Hall',
    subtitle: 'Ground Floor · Room telemetry',
    floors: {
      'Ground Floor': [
        { id: '101', occupants: 22, status: 'Occupied', color: 'blue', temp: '23.4 °C', humidity: '43%', co2: '947 ppm', power: '2.2 kW', energy: '23 kWh', hvac: 'Active', lighting: 'ON', updated: '42 sec ago' },
        { id: '102', occupants: 0, status: 'Available', color: 'green', temp: '22.1 °C', humidity: '40%', co2: '410 ppm', power: '0.2 kW', energy: '4 kWh', hvac: 'Idle', lighting: 'OFF', updated: '15 sec ago' },
        { id: '103', occupants: 7, status: 'Occupied', color: 'green', temp: '23.0 °C', humidity: '42%', co2: '650 ppm', power: '1.1 kW', energy: '14 kWh', hvac: 'Active', lighting: 'ON', updated: '30 sec ago' },
        { id: '104', occupants: 8, status: 'Occupied', color: 'green', temp: '23.2 °C', humidity: '41%', co2: '680 ppm', power: '1.2 kW', energy: '15 kWh', hvac: 'Active', lighting: 'ON', updated: '20 sec ago' },
        { id: '105', occupants: 0, status: 'Warning', color: 'amber', temp: '25.6 °C', humidity: '55%', co2: '890 ppm', power: '2.8 kW', energy: '31 kWh', hvac: 'Active', lighting: 'ON', updated: '10 sec ago' },
        { id: '106', occupants: 10, status: 'Occupied', color: 'green', temp: '22.8 °C', humidity: '44%', co2: '720 ppm', power: '1.4 kW', energy: '18 kWh', hvac: 'Active', lighting: 'ON', updated: '18 sec ago' },
        { id: '107', occupants: 11, status: 'Occupied', color: 'green', temp: '23.1 °C', humidity: '42%', co2: '750 ppm', power: '1.5 kW', energy: '19 kWh', hvac: 'Active', lighting: 'ON', updated: '25 sec ago' },
        { id: '108', occupants: 0, status: 'Available', color: 'green', temp: '21.9 °C', humidity: '39%', co2: '400 ppm', power: '0.1 kW', energy: '3 kWh', hvac: 'Idle', lighting: 'OFF', updated: '50 sec ago' },
        { id: '109', occupants: 18, status: 'Occupied', color: 'green', temp: '23.5 °C', humidity: '45%', co2: '810 ppm', power: '1.9 kW', energy: '22 kWh', hvac: 'Active', lighting: 'ON', updated: '12 sec ago' },
        { id: '110', occupants: 14, status: 'Critical', color: 'red', temp: '26.4 °C', humidity: '58%', co2: '1280 ppm', power: '3.4 kW', energy: '38 kWh', hvac: 'Active', lighting: 'ON', updated: '5 sec ago' },
        { id: '111', occupants: 0, status: 'Available', color: 'green', temp: '22.0 °C', humidity: '41%', co2: '420 ppm', power: '0.2 kW', energy: '5 kWh', hvac: 'Idle', lighting: 'OFF', updated: '40 sec ago' },
        { id: '112', occupants: 16, status: 'Warning', color: 'amber', temp: '24.8 °C', humidity: '50%', co2: '920 ppm', power: '2.5 kW', energy: '28 kWh', hvac: 'Active', lighting: 'ON', updated: '8 sec ago' },
      ],
      'First Floor': Array.from({ length: 13 }, (_, i) => ({
        id: `${201 + i}`,
        occupants: Math.floor(Math.random() * 25),
        status: i % 4 === 0 ? 'Warning' : 'Occupied',
        color: i % 4 === 0 ? 'amber' : 'green',
        temp: '23.1 °C', humidity: '42%', co2: '650 ppm', power: '1.4 kW', energy: '16 kWh', hvac: 'Active', lighting: 'ON', updated: '22 sec ago'
      })),
      'Second Floor': [
        { id: '301', occupants: 15, status: 'Occupied', color: 'green', temp: '22.9 °C', humidity: '41%', co2: '600 ppm', power: '1.3 kW', energy: '14 kWh', hvac: 'Active', lighting: 'ON', updated: '10 sec ago' },
        { id: '302', occupants: 20, status: 'Occupied', color: 'blue', temp: '23.3 °C', humidity: '43%', co2: '710 ppm', power: '1.8 kW', energy: '20 kWh', hvac: 'Active', lighting: 'ON', updated: '15 sec ago' },
      ],
    },
  },
  Engineering: {
    fullName: 'Engineering Block',
    subtitle: 'Floor telemetry and spatial layout',
    floors: {
      'Ground Floor': Array.from({ length: 8 }, (_, i) => ({ id: `${101 + i}`, occupants: 12, status: 'Occupied', color: 'green', temp: '23.0 °C', humidity: '40%', co2: '610 ppm', power: '1.5 kW', energy: '18 kWh', hvac: 'Active', lighting: 'ON', updated: '30 sec ago' })),
      'First Floor': Array.from({ length: 8 }, (_, i) => ({ id: `${201 + i}`, occupants: 15, status: 'Occupied', color: 'green', temp: '22.8 °C', humidity: '41%', co2: '640 ppm', power: '1.6 kW', energy: '19 kWh', hvac: 'Active', lighting: 'ON', updated: '20 sec ago' })),
      'Second Floor': Array.from({ length: 8 }, (_, i) => ({ id: `${301 + i}`, occupants: 8, status: 'Available', color: 'green', temp: '22.5 °C', humidity: '39%', co2: '500 ppm', power: '0.8 kW', energy: '10 kWh', hvac: 'Active', lighting: 'ON', updated: '25 sec ago' })),
      'Third Floor': Array.from({ length: 8 }, (_, i) => ({ id: `${401 + i}`, occupants: 18, status: 'Warning', color: 'amber', temp: '25.1 °C', humidity: '52%', co2: '1100 ppm', power: '2.9 kW', energy: '33 kWh', hvac: 'Active', lighting: 'ON', updated: '5 sec ago' })),
    },
  },
  Law: {
    fullName: 'Law Block',
    subtitle: 'Floor telemetry and spatial layout',
    floors: {
      'Ground Floor': Array.from({ length: 8 }, (_, i) => ({ id: `${101 + i}`, occupants: 10, status: 'Occupied', color: 'green', temp: '22.5 °C', humidity: '40%', co2: '580 ppm', power: '1.2 kW', energy: '15 kWh', hvac: 'Active', lighting: 'ON', updated: '12 sec ago' })),
      'First Floor': Array.from({ length: 8 }, (_, i) => ({ id: `${201 + i}`, occupants: 14, status: 'Occupied', color: 'green', temp: '23.0 °C', humidity: '42%', co2: '620 ppm', power: '1.4 kW', energy: '17 kWh', hvac: 'Active', lighting: 'ON', updated: '18 sec ago' })),
      'Second Floor': Array.from({ length: 8 }, (_, i) => ({ id: `${301 + i}`, occupants: 0, status: 'Available', color: 'green', temp: '21.8 °C', humidity: '38%', co2: '390 ppm', power: '0.1 kW', energy: '2 kWh', hvac: 'Idle', lighting: 'OFF', updated: '45 sec ago' })),
      'Third Floor': Array.from({ length: 8 }, (_, i) => ({ id: `${401 + i}`, occupants: 22, status: 'Critical', color: 'red', temp: '26.8 °C', humidity: '60%', co2: '1350 ppm', power: '3.8 kW', energy: '42 kWh', hvac: 'Active', lighting: 'ON', updated: '2 sec ago' })),
    },
  },
};

function DetailedBuilding({ position, size, isSelected, onClick, baseColor = '#94a3b8', floorsCount = 2 }) {
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

      {Array.from({ length: floorsCount }).map((_, fIndex) => {
        const floorY = (h / floorsCount) * (fIndex + 0.5);
        return (
          <group key={fIndex} position={[0, floorY, 0]}>
            <mesh position={[0, 0, d / 2 + 0.02]}>
              <planeGeometry args={[w * 0.85, (h / floorsCount) * 0.5]} />
              <meshStandardMaterial color={glassColor} roughness={0.1} metalness={0.8} transparent opacity={0.85} />
            </mesh>
            <mesh position={[0, 0, -d / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[w * 0.85, (h / floorsCount) * 0.5]} />
              <meshStandardMaterial color={glassColor} roughness={0.1} metalness={0.8} transparent opacity={0.85} />
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
    <Html position={position} center distanceFactor={24} occlude={false} zIndexRange={[1000, 0]} style={{ pointerEvents: 'auto' }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        type="button"
        className={`px-3.5 py-2 rounded-2xl text-xs font-semibold shadow-2xl transition-all border whitespace-nowrap cursor-pointer select-none flex items-center gap-2.5 ${
          isSelected
            ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-500/20 scale-105'
            : 'bg-white/95 backdrop-blur-md text-slate-800 border-slate-200 hover:bg-slate-50'
        }`}
      >
        {isAlert && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />}
        <div className="text-left">
          <div className="font-bold text-xs pointer-events-none leading-tight">{name}</div>
          <div className={`text-[10px] font-medium pointer-events-none leading-tight mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
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

export default function BuildingView({ onNavigateToDashboard }) {
  const [selectedBuilding, setSelectedBuilding] = useState('SVH');
  const [selectedFloor, setSelectedFloor] = useState('Ground Floor');
  const [selectedRoomId, setSelectedRoomId] = useState('101');
  const [activeTab, setActiveTab] = useState('3D Campus');
  const [isLayersOpen, setIsLayersOpen] = useState(true);

  const [layers, setLayers] = useState({
    buildings: true,
    occupancy: true,
    energyNetwork: false,
    environmental: false,
    alerts: true,
  });

  const buildingConfig = CAMPUS_FLOOR_DATA[selectedBuilding] || CAMPUS_FLOOR_DATA.SVH;
  const currentFloorRooms = buildingConfig.floors[selectedFloor] || buildingConfig.floors['Ground Floor'] || [];
  const selectedRoom = currentFloorRooms.find((r) => r.id === selectedRoomId) || currentFloorRooms[0] || {};

  const handleBuildingChange = (bName) => {
    setSelectedBuilding(bName);
    const floors = Object.keys(CAMPUS_FLOOR_DATA[bName].floors);
    const firstFloor = floors[0];
    setSelectedFloor(firstFloor);
    const firstRoom = CAMPUS_FLOOR_DATA[bName].floors[firstFloor][0]?.id || '101';
    setSelectedRoomId(firstRoom);
  };

  const toggleLayer = (key, e) => {
    if (e) e.stopPropagation();
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeLayerCount = Object.values(layers).filter(Boolean).length;

  const getRoomBorderColor = (color) => {
    switch (color) {
      case 'blue': return 'border-blue-500 bg-blue-50/50 text-blue-900';
      case 'amber': return 'border-amber-400 bg-amber-50/50 text-amber-900';
      case 'red': return 'border-red-500 bg-red-50/50 text-red-900';
      default: return 'border-emerald-500 bg-emerald-50/40 text-emerald-900';
    }
  };

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
            </div>

            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('3D Campus')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  activeTab === '3D Campus' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                3D Campus
              </button>
              <button
                onClick={() => setActiveTab('Floor plan')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  activeTab === 'Floor plan' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                Floor plan
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[550px]">
          <div className="lg:col-span-3 relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden h-[550px] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between z-20 bg-white/90 backdrop-blur">
              <div className="flex items-center gap-3">
                <select
                  value={selectedBuilding}
                  onChange={(e) => handleBuildingChange(e.target.value)}
                  className="appearance-none bg-slate-100 border border-slate-300 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="SVH">SVH</option>
                  <option value="Engineering">Engineering Block</option>
                  <option value="Law">Law Block</option>
                </select>

                {activeTab === 'Floor plan' && (
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {Object.keys(buildingConfig.floors).map((fl) => (
                      <button
                        key={fl}
                        onClick={() => {
                          setSelectedFloor(fl);
                          setSelectedRoomId(buildingConfig.floors[fl][0]?.id || '');
                        }}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                          selectedFloor === fl ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {fl}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500">
                  {activeTab === '3D Campus' ? 'Live spatial 3D architectural twin' : 'Click a room to inspect telemetry'}
                </span>
                <span className="text-red-600 font-bold text-xs ml-2">N ↑</span>
              </div>
            </div>

            {activeTab === '3D Campus' ? (
              <div className="relative flex-1 bg-gradient-to-b from-[#f1f5f9] to-[#e2e8f0]">
                <Canvas shadows camera={{ position: [20, 20, 20], fov: 40 }} style={{ width: '100%', height: '100%' }}>
                  <ambientLight intensity={0.7} />
                  <directionalLight position={[25, 35, 25]} intensity={1.3} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
                  <pointLight position={[-15, 15, -15]} intensity={0.4} />

                  <Suspense fallback={null}>
                    <CampusGround />

                    {layers.buildings && (
                      <>
                        <DetailedBuilding
                          position={[-8, 0, -5]}
                          size={[4.5, 2.2, 3.2]}
                          floorsCount={2}
                          baseColor={layers.environmental ? '#10b981' : '#64748b'}
                          isSelected={selectedBuilding === 'SVH'}
                          onClick={() => handleBuildingChange('SVH')}
                        />
                        <FloatingTag
                          position={[-8, 3.0, -5]}
                          name="SVH"
                          stats={
                            layers.energyNetwork
                              ? '128.4 kW · Active HVAC'
                              : layers.occupancy
                              ? '72% occupied · 128.4 kW'
                              : 'SVH Hall'
                          }
                          isSelected={selectedBuilding === 'SVH'}
                          onClick={() => handleBuildingChange('SVH')}
                          isAlert={layers.alerts}
                        />

                        <DetailedBuilding
                          position={[7, 0, -6]}
                          size={[5, 3.4, 3.5]}
                          floorsCount={4}
                          baseColor={layers.environmental ? '#10b981' : '#475569'}
                          isSelected={selectedBuilding === 'Engineering'}
                          onClick={() => handleBuildingChange('Engineering')}
                        />
                        <FloatingTag
                          position={[7, 4.2, -6]}
                          name="Engineering Block"
                          stats={
                            layers.energyNetwork
                              ? '96.8 kW · Active HVAC'
                              : layers.occupancy
                              ? '64% occupied · 96.8 kW'
                              : 'Engineering'
                          }
                          isSelected={selectedBuilding === 'Engineering'}
                          onClick={() => handleBuildingChange('Engineering')}
                          isAlert={layers.alerts}
                        />

                        <DetailedBuilding
                          position={[0, 0, 8]}
                          size={[4.8, 2.6, 3]}
                          floorsCount={3}
                          baseColor={layers.environmental ? '#10b981' : '#64748b'}
                          isSelected={selectedBuilding === 'Law'}
                          onClick={() => handleBuildingChange('Law')}
                        />
                        <FloatingTag
                          position={[0, 3.2, 8]}
                          name="Law Block"
                          stats={
                            layers.energyNetwork
                              ? '67.2 kW · Active HVAC'
                              : layers.occupancy
                              ? '48% occupied · 67.2 kW'
                              : 'Law Block'
                          }
                          isSelected={selectedBuilding === 'Law'}
                          onClick={() => handleBuildingChange('Law')}
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
                  <OrbitControls enableZoom enableRotate enablePan={false} maxPolarAngle={Math.PI / 2.25} minDistance={12} maxDistance={45} />
                </Canvas>

                {/* Visible Layers Interactive Control Box */}
                <div className="absolute bottom-4 left-4 z-30 bg-white/95 backdrop-blur rounded-2xl border border-slate-200/80 shadow-xl w-60 overflow-hidden select-none">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLayersOpen(!isLayersOpen);
                    }}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50/80 border-b border-slate-100 cursor-pointer hover:bg-slate-100/80 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">Visible layers</span>
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
                      {/* Buildings Toggle */}
                      <button
                        type="button"
                        onClick={(e) => toggleLayer('buildings', e)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/80 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4 text-slate-600" />
                          <span className="text-xs font-semibold text-slate-700">3D Buildings</span>
                        </div>
                        <div className={`w-8 h-4 rounded-full transition-colors relative ${layers.buildings ? 'bg-blue-600' : 'bg-slate-300'}`}>
                          <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${layers.buildings ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                      </button>

                      {/* Occupancy Toggle */}
                      <button
                        type="button"
                        onClick={(e) => toggleLayer('occupancy', e)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/80 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Activity className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-semibold text-slate-700">Occupancy</span>
                        </div>
                        <div className={`w-8 h-4 rounded-full transition-colors relative ${layers.occupancy ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                          <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${layers.occupancy ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                      </button>

                      {/* Energy Load Toggle */}
                      <button
                        type="button"
                        onClick={(e) => toggleLayer('energyNetwork', e)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/80 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-semibold text-slate-700">Energy Load</span>
                        </div>
                        <div className={`w-8 h-4 rounded-full transition-colors relative ${layers.energyNetwork ? 'bg-amber-500' : 'bg-slate-300'}`}>
                          <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${layers.energyNetwork ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                      </button>

                      {/* Environmental Toggle */}
                      <button
                        type="button"
                        onClick={(e) => toggleLayer('environmental', e)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/80 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Wind className="w-4 h-4 text-sky-500" />
                          <span className="text-xs font-semibold text-slate-700">Indoor Climate</span>
                        </div>
                        <div className={`w-8 h-4 rounded-full transition-colors relative ${layers.environmental ? 'bg-sky-500' : 'bg-slate-300'}`}>
                          <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${layers.environmental ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                      </button>

                      {/* Active Alerts Toggle */}
                      <button
                        type="button"
                        onClick={(e) => toggleLayer('alerts', e)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/80 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-xs font-semibold text-slate-700">Active Alerts</span>
                        </div>
                        <div className={`w-8 h-4 rounded-full transition-colors relative ${layers.alerts ? 'bg-red-500' : 'bg-slate-300'}`}>
                          <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${layers.alerts ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 p-6 bg-slate-100/60 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {currentFloorRooms.slice(0, 4).map((rm) => (
                      <button
                        key={rm.id}
                        onClick={() => setSelectedRoomId(rm.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${getRoomBorderColor(rm.color)} ${
                          selectedRoomId === rm.id ? 'ring-2 ring-blue-500 scale-[1.02] shadow-md' : 'hover:shadow'
                        }`}
                      >
                        <span className="text-[10px] font-bold tracking-wider uppercase opacity-75">ROOM</span>
                        <span className="text-lg font-black">{rm.id}</span>
                        <span className="text-xs font-semibold mt-1">
                          {rm.occupants > 0 ? `${rm.occupants} people` : 'Available'}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-200/80 rounded-xl py-2 text-center text-xs font-black tracking-widest text-slate-500 uppercase">
                    CENTRAL CORRIDOR
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {currentFloorRooms.slice(4, 8).map((rm) => (
                      <button
                        key={rm.id}
                        onClick={() => setSelectedRoomId(rm.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${getRoomBorderColor(rm.color)} ${
                          selectedRoomId === rm.id ? 'ring-2 ring-blue-500 scale-[1.02] shadow-md' : 'hover:shadow'
                        }`}
                      >
                        <span className="text-[10px] font-bold tracking-wider uppercase opacity-75">ROOM</span>
                        <span className="text-lg font-black">{rm.id}</span>
                        <span className="text-xs font-semibold mt-1">
                          {rm.occupants > 0 ? `${rm.occupants} people` : 'Available'}
                        </span>
                      </button>
                    ))}
                  </div>

                  {currentFloorRooms.length > 8 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                      {currentFloorRooms.slice(8).map((rm) => (
                        <button
                          key={rm.id}
                          onClick={() => setSelectedRoomId(rm.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${getRoomBorderColor(rm.color)} ${
                            selectedRoomId === rm.id ? 'ring-2 ring-blue-500 scale-[1.02] shadow-md' : 'hover:shadow'
                          }`}
                        >
                          <span className="text-[10px] font-bold tracking-wider uppercase opacity-75">ROOM</span>
                          <span className="text-lg font-black">{rm.id}</span>
                          <span className="text-xs font-semibold mt-1">
                            {rm.occupants > 0 ? `${rm.occupants} people` : 'Available'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{buildingConfig.fullName}</h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {selectedFloor} · Room {selectedRoom.id || '101'}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-900">{selectedRoom.status || 'Occupied'}</span>
                </div>
                <span className="text-xs font-bold text-emerald-800">{selectedRoom.occupants || 0} occupants</span>
              </div>

              <div className="grid grid-cols-2 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
                <div className="bg-white p-3.5">
                  <p className="text-[11px] text-slate-500 font-medium">Temperature</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{selectedRoom.temp || '23.4 °C'}</p>
                </div>
                <div className="bg-white p-3.5">
                  <p className="text-[11px] text-slate-500 font-medium">Humidity</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{selectedRoom.humidity || '43%'}</p>
                </div>
                <div className="bg-white p-3.5">
                  <p className="text-[11px] text-slate-500 font-medium">CO₂</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{selectedRoom.co2 || '947 ppm'}</p>
                </div>
                <div className="bg-white p-3.5">
                  <p className="text-[11px] text-slate-500 font-medium">Active power</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{selectedRoom.power || '2.2 kW'}</p>
                </div>
                <div className="bg-white p-3.5">
                  <p className="text-[11px] text-slate-500 font-medium">Energy today</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{selectedRoom.energy || '23 kWh'}</p>
                </div>
                <div className="bg-white p-3.5">
                  <p className="text-[11px] text-slate-500 font-medium">HVAC</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{selectedRoom.hvac || 'Active'}</p>
                </div>
                <div className="bg-white p-3.5">
                  <p className="text-[11px] text-slate-500 font-medium">Lighting</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{selectedRoom.lighting || 'ON'}</p>
                </div>
                <div className="bg-white p-3.5">
                  <p className="text-[11px] text-slate-500 font-medium">Updated</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{selectedRoom.updated || '42 sec ago'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={onNavigateToDashboard}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition cursor-pointer mt-6"
            >
              View building details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}