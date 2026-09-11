import type { CSSProperties } from "react";

const VIEWBOX_WIDTH = 800;
const VIEWBOX_HEIGHT = 400;
const COL_SPACING = 38;
const ROW_SPACING = Math.round(COL_SPACING * (Math.sqrt(3) / 2));

type Point = { x: number; y: number };
type GridPoint = Point & { row: number; col: number };
type Edge = [number, number];

/**
 * 삼각 격자 형태로 배치된 메시 좌표를 생성하는 함수.
 * 짝수/홀수 행마다 절반 간격씩 어긋나게 배치해, 일정한 구조의 그물망을 만든다.
 */
function generateMeshPoints(): GridPoint[] {
  const rowCount = Math.ceil(VIEWBOX_HEIGHT / ROW_SPACING) + 2;
  const colCount = Math.ceil(VIEWBOX_WIDTH / COL_SPACING) + 2;
  const points: GridPoint[] = [];

  for (let row = -1; row <= rowCount; row++) {
    const isOffsetRow = row % 2 !== 0;
    const xOffset = isOffsetRow ? COL_SPACING / 2 : 0;

    for (let col = -1; col <= colCount; col++) {
      points.push({
        row,
        col,
        x: col * COL_SPACING + xOffset,
        y: row * ROW_SPACING,
      });
    }
  }

  return points;
}

/**
 * 격자 좌표를 삼각형 그물망으로 잇는 함수.
 * 각 점을 오른쪽 이웃과 다음 행의 이웃 두 점에 연결해 끊김 없는 균일한 메시를 만든다.
 */
function generateMeshEdges(points: GridPoint[]): Edge[] {
  const indexByKey = new Map<string, number>();
  points.forEach((point, index) =>
    indexByKey.set(`${point.row}-${point.col}`, index),
  );

  const edges: Edge[] = [];

  points.forEach((point, index) => {
    const rightIndex = indexByKey.get(`${point.row}-${point.col + 1}`);
    if (rightIndex !== undefined) edges.push([index, rightIndex]);

    const isOffsetRow = point.row % 2 !== 0;
    const nextRowColOffsets = isOffsetRow ? [0, 1] : [0, -1];

    nextRowColOffsets.forEach((colOffset) => {
      const neighborIndex = indexByKey.get(
        `${point.row + 1}-${point.col + colOffset}`,
      );
      if (neighborIndex !== undefined) edges.push([index, neighborIndex]);
    });
  });

  return edges;
}

const MESH_POINTS = generateMeshPoints();
const MESH_EDGES = generateMeshEdges(MESH_POINTS);

type MeshLinesProps = {
  lineClassName: string;
  lineStyle: CSSProperties;
  pointClassName: string;
  pointRadius: number;
};

function MeshLines({
  lineClassName,
  lineStyle,
  pointClassName,
  pointRadius,
}: MeshLinesProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
    >
      <g className={lineClassName} style={lineStyle}>
        {MESH_EDGES.map(([from, to], index) => (
          <line
            key={index}
            x1={MESH_POINTS[from].x}
            y1={MESH_POINTS[from].y}
            x2={MESH_POINTS[to].x}
            y2={MESH_POINTS[to].y}
          />
        ))}
      </g>
      <g className={pointClassName}>
        {MESH_POINTS.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r={pointRadius} />
        ))}
      </g>
    </svg>
  );
}

/** 랜딩 화면 상단을 채우는 점-선 네트워크 메시 배경 */
export function MeshNetworkBackground() {
  return (
    <div
      className="absolute inset-x-0 top-0 h-[66vh] max-h-[760px] overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to bottom, black 0%, black 35%, transparent 92%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black 0%, black 35%, transparent 92%)",
      }}
    >
      <MeshLines
        lineClassName="stroke-foreground/[0.03]"
        lineStyle={{ strokeWidth: 0.5 }}
        pointClassName="fill-foreground/5"
        pointRadius={1}
      />

      <div className="animate-mesh-pulse absolute inset-0">
        <MeshLines
          lineClassName="stroke-primary/45"
          lineStyle={{ strokeWidth: 0.6 }}
          pointClassName="fill-primary/60"
          pointRadius={1.3}
        />
      </div>

      <div className="animate-mesh-core bg-primary/20 absolute left-1/2 top-[45%] size-56 rounded-full blur-3xl" />
    </div>
  );
}
