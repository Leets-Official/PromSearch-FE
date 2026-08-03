"use client";

import { useCallback, useMemo } from "react";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

import { AI_MODELS, JOB_CATEGORIES, OUTPUT_TYPES, TASKS } from "@/features/gallery/categories";
import type {
  AiModel,
  GalleryNav,
  GalleryQuery,
  JobCategory,
  OutputType,
  Task,
} from "@/features/gallery/types";

const NAV_VALUES = ["home", "popular", "job"] as const satisfies readonly GalleryNav[];
const JOB_VALUES = JOB_CATEGORIES.map((o) => o.value);
const TASK_VALUES = TASKS.map((o) => o.value);
const MODEL_VALUES = AI_MODELS.map((o) => o.value);
const OUTPUT_VALUES = OUTPUT_TYPES.map((o) => o.value);

// URL 쿼리 파서 정의. 결과물타입은 URL 상 `types` 키를 쓴다(핸들러/`toSearchParams`와 일치).
const filterParsers = {
  nav: parseAsStringLiteral(NAV_VALUES).withDefault("home"),
  job: parseAsStringLiteral(JOB_VALUES),
  tasks: parseAsArrayOf(parseAsStringLiteral(TASK_VALUES)).withDefault([]),
  models: parseAsArrayOf(parseAsStringLiteral(MODEL_VALUES)).withDefault([]),
  types: parseAsArrayOf(parseAsStringLiteral(OUTPUT_VALUES)).withDefault([]),
  q: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/**
 * 홈 갤러리 필터/페이지 상태를 URL 쿼리로 관리한다.
 *
 * 핵심 규칙: **필터/검색이 바뀌면 page 는 항상 1로 리셋**한다(다른 페이지에서 필터를 바꿔도
 * 결과 없는 페이지에 갇히지 않도록). page 자체 변경만 리셋에서 제외한다.
 */
export function useGalleryFilters() {
  const [state, setState] = useQueryStates(filterParsers);

  const query: GalleryQuery = useMemo(
    () => ({
      nav: state.nav,
      job: state.job,
      tasks: state.tasks,
      models: state.models,
      outputTypes: state.types,
      q: state.q,
      page: state.page,
    }),
    [state],
  );

  // 사이드바: 홈/인기 선택 (직군 해제)
  const setNav = useCallback(
    (nav: Exclude<GalleryNav, "job">) => {
      void setState({ nav, job: null, page: 1 });
    },
    [setState],
  );

  // 사이드바: 직군 선택 (nav=job)
  const selectJob = useCallback(
    (job: JobCategory) => {
      void setState({ nav: "job", job, page: 1 });
    },
    [setState],
  );

  const toggleTask = useCallback(
    (task: Task) => {
      void setState((prev) => ({ tasks: toggle(prev.tasks, task), page: 1 }));
    },
    [setState],
  );

  const toggleModel = useCallback(
    (model: AiModel) => {
      void setState((prev) => ({ models: toggle(prev.models, model), page: 1 }));
    },
    [setState],
  );

  const toggleOutputType = useCallback(
    (type: OutputType) => {
      void setState((prev) => ({ types: toggle(prev.types, type), page: 1 }));
    },
    [setState],
  );

  // 드롭다운(멀티 셀렉트)에서 선택 배열을 통째로 교체할 때 사용 (page 리셋 포함)
  const setTasks = useCallback(
    (tasks: Task[]) => {
      void setState({ tasks, page: 1 });
    },
    [setState],
  );

  const setModels = useCallback(
    (models: AiModel[]) => {
      void setState({ models, page: 1 });
    },
    [setState],
  );

  const setOutputTypes = useCallback(
    (types: OutputType[]) => {
      void setState({ types, page: 1 });
    },
    [setState],
  );

  const setSearch = useCallback(
    (q: string) => {
      void setState({ q, page: 1 });
    },
    [setState],
  );

  // 페이지 이동만은 page 리셋 대상이 아니다
  const setPage = useCallback(
    (page: number) => {
      void setState({ page });
    },
    [setState],
  );

  const reset = useCallback(() => {
    void setState({ nav: "home", job: null, tasks: [], models: [], types: [], q: "", page: 1 });
  }, [setState]);

  return {
    query,
    setNav,
    selectJob,
    toggleTask,
    toggleModel,
    toggleOutputType,
    setTasks,
    setModels,
    setOutputTypes,
    setSearch,
    setPage,
    reset,
  };
}
