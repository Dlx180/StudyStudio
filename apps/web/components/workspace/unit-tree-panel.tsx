import type { ReadingUnit } from "@knowtree/shared";
import type { UnitSelectHandler } from "./types";

function UnitNode({ unit, currentPage, onSelect }: { unit: ReadingUnit; currentPage: number; onSelect: UnitSelectHandler }) {
  const active = currentPage >= unit.startPage && currentPage <= unit.endPage;

  return (
    <li>
      <button className={active ? "unit-node active" : "unit-node"} onClick={() => onSelect(unit)}>
        <span>{unit.title}</span>
        <small>
          p. {unit.startPage}-{unit.endPage} - {unit.state}
        </small>
      </button>
      {unit.children.length > 0 ? (
        <ul className="unit-children">
          {unit.children.map((child) => (
            <UnitNode key={child.unitId} unit={child} currentPage={currentPage} onSelect={onSelect} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function UnitTreePanel({
  units,
  activeUnit,
  currentPage,
  onSelectUnit,
}: {
  units: ReadingUnit[];
  activeUnit: ReadingUnit;
  currentPage: number;
  onSelectUnit: UnitSelectHandler;
}) {
  return (
    <>
      <ul className="unit-tree">
        {units.map((unit) => (
          <UnitNode key={unit.unitId} unit={unit} currentPage={currentPage} onSelect={onSelectUnit} />
        ))}
      </ul>
      <section className="unit-detail">
        <h3>{activeUnit.title}</h3>
        <p>{activeUnit.summary}</p>
        <dl>
          <div>
            <dt>Page range</dt>
            <dd>
              {activeUnit.startPage}-{activeUnit.endPage}
            </dd>
          </div>
          <div>
            <dt>State</dt>
            <dd>{activeUnit.state}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
