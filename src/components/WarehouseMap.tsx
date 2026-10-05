import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Rect, Text, Line, Group, Circle } from "react-konva";
import { useFleetStore } from "../store/useFleetStore";
import { RACKS, CHARGING_STATION } from "../simulation/mockEngine";
import { Cpu, Play, RotateCcw } from "lucide-react";

export const WarehouseMap: React.FC = () => {
  const {
    amrs,
    selectedAmrId,
    setSelectedAmrId,
    runDemoMission,
    resetSimulation,
  } = useFleetStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 620, height: 420 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth || 620;
        const height = containerRef.current.clientHeight || 420;
        setStageDimensions({
          width: Math.max(300, width),
          height: Math.max(300, height),
        });
      }
    };
    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const scaleX = stageDimensions.width / 600;
  const scaleY = stageDimensions.height / 420;

  const getCommColor = (mode: string) => {
    switch (mode) {
      case "central":
        return "#CFDECA"; // Honeydew
      case "mesh":
        return "#EFF0A3"; // Vanilla
      case "isolated":
        return "#F2B8B5"; // Soft Red
      default:
        return "#D5D7DA";
    }
  };

  const xAisles = [30, 195, 345, 520];
  const yAisles = [25, 140, 260, 380];

  return (
    <div className="w-full h-full bg-[#FFFFFF] border border-[#C3CCDA] rounded-[4px] flex flex-col relative select-none">
      {/* Map Header & Controls */}
      <div className="bg-[#F6F5FA] border-b border-[#C3CCDA] px-3 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 font-bold text-[#212121]">
          <Cpu className="w-4 h-4 text-[#212121]" />
          <span className="uppercase tracking-wider">Warehouse Grid Map</span>
        </div>

        {/* Map Top Control Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={runDemoMission}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-[4px] bg-[#212121] hover:bg-[#333333] text-white font-bold text-[11px] transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3 mr-1" />
            <span>Run Demo Mission</span>
          </button>

          <button
            onClick={resetSimulation}
            className="flex items-center space-x-1 px-2 py-1 rounded-[4px] border border-[#C3CCDA] bg-[#FFFFFF] hover:bg-[#F6F5FA] text-[#212121] font-semibold text-[11px] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 mr-1 text-[#5C6269]" />
            <span>Reset</span>
          </button>

          <div className="hidden sm:flex items-center space-x-3 text-[10px] ml-2 pl-2 border-l border-[#C3CCDA]">
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-[#CFDECA] inline-block rounded-[2px] border border-[#C3CCDA]"></span>
              <span className="text-[#5C6269]">Central</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-[#EFF0A3] inline-block rounded-[2px] border border-[#C3CCDA]"></span>
              <span className="text-[#5C6269]">Mesh</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-[#F2B8B5] inline-block rounded-[2px] border border-[#C3CCDA]"></span>
              <span className="text-[#5C6269]">Isolated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Canvas Area */}
      <div ref={containerRef} className="flex-1 w-full h-full relative overflow-hidden bg-[#F6F5FA]">
        <Stage width={stageDimensions.width} height={stageDimensions.height}>
          <Layer>
            {/* Grid Lines */}
            {Array.from({ length: 16 }).map((_, i) => (
              <Line
                key={`grid-v-${i}`}
                points={[i * 40 * scaleX, 0, i * 40 * scaleX, stageDimensions.height]}
                stroke="#E2E7F0"
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: 11 }).map((_, i) => (
              <Line
                key={`grid-h-${i}`}
                points={[0, i * 40 * scaleY, stageDimensions.width, i * 40 * scaleY]}
                stroke="#E2E7F0"
                strokeWidth={1}
              />
            ))}

            {/* Aisle Driving Guidelines */}
            {xAisles.map((x) => (
              <Line
                key={`aisle-x-${x}`}
                points={[x * scaleX, 0, x * scaleX, stageDimensions.height]}
                stroke="#C3CCDA"
                strokeWidth={1}
                dash={[4, 6]}
              />
            ))}
            {yAisles.map((y) => (
              <Line
                key={`aisle-y-${y}`}
                points={[0, y * scaleY, stageDimensions.width, y * scaleY]}
                stroke="#C3CCDA"
                strokeWidth={1}
                dash={[4, 6]}
              />
            ))}

            {/* Storage Racks */}
            {RACKS.map((rack) => (
              <Group key={rack.id}>
                <Rect
                  x={rack.x * scaleX}
                  y={rack.y * scaleY}
                  width={rack.w * scaleX}
                  height={rack.h * scaleY}
                  fill="#D8DFE9"
                  stroke="#C3CCDA"
                  strokeWidth={1.5}
                  cornerRadius={4}
                />
                <Text
                  x={rack.x * scaleX}
                  y={rack.y * scaleY + (rack.h * scaleY) / 2 - 5}
                  width={rack.w * scaleX}
                  text={rack.label}
                  fontSize={10}
                  fontFamily="Times New Roman"
                  fill="#212121"
                  fontStyle="bold"
                  align="center"
                />
              </Group>
            ))}

            {/* Enlarged Multi-Dock Charging Station Bay */}
            <Group>
              <Rect
                x={15 * scaleX}
                y={380 * scaleY - 15}
                width={80 * scaleX}
                height={34 * scaleY}
                fill="#EFF0A3"
                stroke="#C3CCDA"
                strokeWidth={1}
                cornerRadius={4}
              />
              <Text
                x={15 * scaleX}
                y={380 * scaleY - 10}
                width={80 * scaleX}
                text="CHARGING BAY (MULTI-DOCK)"
                fontSize={7.5}
                fontFamily="Times New Roman"
                fill="#212121"
                fontStyle="bold"
                align="center"
              />
              {/* Visual Charging Port Indicators */}
              {[30, 55, 80].map((dockX, i) => (
                <Circle
                  key={`dock-${i}`}
                  x={dockX * scaleX}
                  y={380 * scaleY + 8}
                  radius={2.5}
                  fill="#95C292"
                  stroke="#212121"
                  strokeWidth={0.5}
                />
              ))}
            </Group>

            {/* Horizontal Idle Staging Queue (Beside Enlarged Charging Bay) */}
            <Group>
              <Rect
                x={102 * scaleX}
                y={380 * scaleY - 15}
                width={263 * scaleX}
                height={34 * scaleY}
                fill="#D8DFE9"
                stroke="#C3CCDA"
                strokeWidth={1}
                dash={[4, 3]}
                cornerRadius={4}
              />
              <Text
                x={102 * scaleX}
                y={380 * scaleY - 8}
                width={263 * scaleX}
                text="IDLE STAGING QUEUE (PARKING BAY)"
                fontSize={8}
                fontFamily="Times New Roman"
                fill="#212121"
                fontStyle="bold"
                align="center"
              />
            </Group>

            {/* AMR Path Trails */}
            {amrs.map((amr) => {
              if (!amr.path || amr.path.length < 2) return null;
              const pathColor = getCommColor(amr.commMode);
              const points = amr.path.flatMap((p) => [p.x * scaleX, p.y * scaleY]);
              return (
                <Line
                  key={`path-${amr.id}`}
                  points={points}
                  stroke={pathColor}
                  strokeWidth={1.5}
                  dash={[4, 4]}
                />
              );
            })}

            {/* Blocked Aisle Alerts */}
            {amrs.map((amr) => {
              if (!amr.blockedAisleAlert) return null;
              return (
                <Group key={`blocked-${amr.id}`}>
                  <Circle
                    x={195 * scaleX}
                    y={140 * scaleY}
                    radius={12}
                    fill="#F2B8B5"
                    stroke="#212121"
                    strokeWidth={1.5}
                  />
                  <Text
                    x={180 * scaleX}
                    y={136 * scaleY}
                    width={30}
                    text="BLOCKED"
                    fontSize={7}
                    fontFamily="Times New Roman"
                    fill="#212121"
                    fontStyle="bold"
                    align="center"
                  />
                </Group>
              );
            })}

            {/* AMR Icons */}
            {amrs.map((amr, idx) => {
              const color = getCommColor(amr.commMode);
              const isSelected = selectedAmrId === amr.id;

              const displayPos = amr.position;
              const cx = displayPos.x * scaleX;
              const cy = displayPos.y * scaleY;

              const rad = (amr.heading * Math.PI) / 180;
              const arrowLength = 13;
              const ax = cx + Math.cos(rad) * arrowLength;
              const ay = cy + Math.sin(rad) * arrowLength;

              const labelOffsetY = idx % 2 === 0 ? 15 : -24;

              return (
                <Group
                  key={`amr-${amr.id}`}
                  onClick={() => setSelectedAmrId(amr.id)}
                  onTap={() => setSelectedAmrId(amr.id)}
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <Circle
                      x={cx}
                      y={cy}
                      radius={16}
                      stroke="#212121"
                      strokeWidth={2}
                      dash={[3, 3]}
                    />
                  )}

                  {/* AMR Circle Chassis */}
                  <Circle
                    x={cx}
                    y={cy}
                    radius={10}
                    fill={color}
                    stroke="#212121"
                    strokeWidth={1.5}
                  />

                  {/* Heading Line */}
                  <Line
                    points={[cx, cy, ax, ay]}
                    stroke="#212121"
                    strokeWidth={2}
                  />

                  {/* ID Tag */}
                  <Rect
                    x={cx - 32}
                    y={cy + labelOffsetY - 1}
                    width={64}
                    height={13}
                    fill="#FFFFFF"
                    stroke="#C3CCDA"
                    strokeWidth={1}
                    cornerRadius={3}
                  />
                  <Text
                    x={cx - 32}
                    y={cy + labelOffsetY + 1}
                    width={64}
                    text={`${amr.id} (${Math.round(amr.battery)}%)`}
                    fontSize={8}
                    fontFamily="Times New Roman"
                    fill="#212121"
                    fontStyle="bold"
                    align="center"
                  />
                </Group>
              );
            })}
          </Layer>
        </Stage>
      </div>

      {/* Map Footer Bar */}
      <div className="bg-[#F6F5FA] border-t border-[#C3CCDA] px-3 py-1.5 flex items-center justify-between text-[11px] text-[#5C6269]">
        <div>
          <span className="font-semibold text-[#212121]">SELECTED AMR: </span>
          <span className="font-mono font-bold text-[#212121]">{selectedAmrId || "NONE (Click robot on map)"}</span>
        </div>
        <div className="flex space-x-3 font-mono">
          <span>Aisle Network: Operational</span>
          <span>Collision Avoidance: Active</span>
        </div>
      </div>
    </div>
  );
};
