import type { AppealCategory, BookingRulesContent } from "./types";
import { catalog, cloneCatalog } from "./catalog";

export type RefusalMessage = {
  greetingRu: string;
  greetingKy: string;
  bodyRu: string[];
  bodyKy: string[];
  closingRu: string;
  closingKy: string;
};

export type EligibilityNode = {
  id: string;
  labelRu: string;
  labelKy: string;
  children?: EligibilityNode[];
  allowed?: boolean;
  category?: AppealCategory;
  topicRu?: string;
  topicKy?: string;
  refusal?: RefusalMessage;
};

export const ELIGIBILITY_TREE: EligibilityNode[] = catalog.eligibilityTree;

export const BOOKING_RULES: BookingRulesContent = catalog.bookingRules;

export const DEFAULT_REFUSAL: RefusalMessage = {
  greetingRu: "Уважаемый пользователь!",
  greetingKy: "Урматтуу колдонуучу!",
  closingRu: "С уважением, Верховный суд Кыргызской Республики.",
  closingKy: "Урматтоо менен, Кыргыз Республикасынын Жогорку соту.",
  bodyRu: [
    "К сожалению, Ваше обращение не входит в круг вопросов, по которым проводится личный приём руководством Верховного суда Кыргызской Республики.",
    "На личном приёме не рассматриваются конкретные судебные дела, законность судебных решений и результаты рассмотрения дел.",
    "Независимость судей обеспечивается в полном объёме: вмешательство в осуществление правосудия недопустимо.",
    "Приём проводится по вопросам организации судопроизводства, деятельности суда и предложениям по законодательству Кыргызской Республики.",
  ],
  bodyKy: [
    "Тилекке каршы, Сиздин кайрылууңуз жеке кабыл алуу жүргүзүлүүчү маселелерге кирбейт.",
    "Жеке кабыл алууда конкреттүү сот иштери, сот чечимдеринин мыйзамдуулугу жана иштерди кароонун натыйжалары талкууланбайт.",
    "Соттордун көз карандысыздыгы толук сакталат.",
    "Кабыл алуу сот өндүрүшүн уюштуруу, соттун иши жана мыйзамдар боюнча сунуштар боюнча жүргүзүлөт.",
  ],
};

export function cloneEligibilityTree(
  nodes: EligibilityNode[] = ELIGIBILITY_TREE
): EligibilityNode[] {
  return cloneCatalog(nodes);
}

export function findNode(
  id: string,
  nodes: EligibilityNode[] = ELIGIBILITY_TREE
): EligibilityNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNode(id, n.children);
      if (found) return found;
    }
  }
  return undefined;
}

export function resolvePath(
  ids: string[],
  tree: EligibilityNode[] = ELIGIBILITY_TREE
): EligibilityNode[] {
  const out: EligibilityNode[] = [];
  let level: EligibilityNode[] | undefined = tree;
  for (const id of ids) {
    if (!level) break;
    const node: EligibilityNode | undefined = level.find((n) => n.id === id);
    if (!node) break;
    out.push(node);
    level = node.children;
  }
  return out;
}

export function getLeaf(
  pathIds: string[],
  tree: EligibilityNode[] = ELIGIBILITY_TREE
): EligibilityNode | undefined {
  if (pathIds.length === 0) return undefined;
  const path = resolvePath(pathIds, tree);
  if (path.length !== pathIds.length) return undefined;
  const last = path[path.length - 1];
  if (last.children?.length) return undefined;
  return last;
}

export function isPathAllowed(
  pathIds: string[],
  tree: EligibilityNode[] = ELIGIBILITY_TREE
): boolean {
  const leaf = getLeaf(pathIds, tree);
  return Boolean(leaf?.allowed);
}

export function getPathRefusal(
  pathIds: string[],
  tree: EligibilityNode[] = ELIGIBILITY_TREE
): RefusalMessage | null {
  const leaf = getLeaf(pathIds, tree);
  if (!leaf || leaf.allowed) return null;
  return leaf.refusal ?? DEFAULT_REFUSAL;
}

export function updateEligibilityNode(
  tree: EligibilityNode[],
  id: string,
  patch: Partial<EligibilityNode>
): EligibilityNode[] {
  return tree.map((n) => {
    if (n.id === id) {
      return { ...n, ...patch, children: n.children };
    }
    if (n.children?.length) {
      return {
        ...n,
        children: updateEligibilityNode(n.children, id, patch),
      };
    }
    return n;
  });
}

export function deleteEligibilityNode(
  tree: EligibilityNode[],
  id: string
): EligibilityNode[] {
  return tree
    .filter((n) => n.id !== id)
    .map((n) =>
      n.children
        ? { ...n, children: deleteEligibilityNode(n.children, id) }
        : n
    );
}

export function addEligibilityChild(
  tree: EligibilityNode[],
  parentId: string | null,
  node: EligibilityNode
): EligibilityNode[] {
  if (!parentId) return [...tree, node];
  return tree.map((n) => {
    if (n.id === parentId) {
      return {
        ...n,
        children: [...(n.children ?? []), node],
        allowed: undefined,
        category: undefined,
        topicRu: undefined,
        topicKy: undefined,
        refusal: undefined,
      };
    }
    if (n.children?.length) {
      return {
        ...n,
        children: addEligibilityChild(n.children, parentId, node),
      };
    }
    return n;
  });
}
