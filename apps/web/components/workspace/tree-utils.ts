import type { ReadingUnit } from "@knowtree/shared";
import type { ConceptItem, ConceptTreeNode } from "./types";

export function flattenUnits(tree: ReadingUnit[]): ReadingUnit[] {
  return tree.flatMap((unit) => [unit, ...flattenUnits(unit.children)]);
}

export function flattenConceptTree(nodes: ConceptTreeNode[]): ConceptTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenConceptTree(node.children)]);
}

export function countTreeNodes(nodes: ConceptTreeNode[]): number {
  return nodes.reduce((count, node) => count + 1 + countTreeNodes(node.children), 0);
}

export function addConceptToTree(nodes: ConceptTreeNode[], concept: ConceptItem, parentId: string | null): ConceptTreeNode[] {
  const newNode: ConceptTreeNode = { ...concept, children: [] };

  if (!parentId) {
    return [...nodes, newNode];
  }

  return nodes.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...node.children, newNode] };
    }

    return { ...node, children: addConceptToTree(node.children, concept, parentId) };
  });
}

export function removeConceptFromTree(nodes: ConceptTreeNode[], conceptId: string): ConceptTreeNode[] {
  return nodes
    .filter((node) => node.id !== conceptId)
    .map((node) => ({ ...node, children: removeConceptFromTree(node.children, conceptId) }));
}
