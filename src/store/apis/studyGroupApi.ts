import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { StudyGroupRole } from '@/types/enums';
import { StudyGroup } from '@/types/group';

// Define response type
interface UserStatsResponse {
  message: string;
  result: {
    userData: {
      _id: string;
      name: string;
      username: string;
      bio?: string;
    };
    questionsCount: number;
    repliesCount: number;
    points: number;
    role: StudyGroupRole;
    isFollow: boolean | null;
  };
}

// Define paginated response types
interface PaginatedStudyGroupsResponse {
  message: string;
  result: {
    study_groups: StudyGroup[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface RecommendedGroupsResponse {
  message: string;
  result: {
    recommended_groups: StudyGroup[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface TrendingGroupsResponse {
  message: string;
  result: {
    trending_groups: StudyGroup[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// Define pagination request params
interface PaginationParams {
  page: number;
  limit: number;
}

const { VITE_API_URL } = import.meta.env;

export const studyGroupApi = createApi({
  reducerPath: 'studyGroupApi',
  baseQuery: fetchBaseQuery({
    baseUrl: VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  endpoints: (builder) => ({
    getGroupUserStats: builder.query<UserStatsResponse, { groupId: string; userId: string }>({
      query: ({ groupId, userId }) => `/study-groups/${groupId}/users/${userId}/stats`,
      keepUnusedDataFor: 300,
      transformResponse: (response: UserStatsResponse) => response
    }),

    // Updated to support pagination with infinite scrolling
    getJoinedGroups: builder.query<
      {
        study_groups: StudyGroup[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      },
      PaginationParams
    >({
      query: ({ page, limit }) => ({
        url: '/study-groups',
        params: { page, limit }
      }),
      transformResponse: (response: PaginatedStudyGroupsResponse) => response.result,
      // Enable merging results for infinite scrolling
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      // Only merge if it's the same endpoint and the page has changed
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          // If it's the first page, replace the cache
          return newItems;
        }

        // For subsequent pages, append the new items
        return {
          ...newItems,
          study_groups: [...currentCache.study_groups, ...newItems.study_groups]
        };
      },
      // Always refetch when we have a new page value
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      }
    }),

    // Updated to support pagination with infinite scrolling
    getRecommendedGroups: builder.query<
      {
        recommended_groups: StudyGroup[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      },
      PaginationParams
    >({
      query: ({ page, limit }) => ({
        url: '/recommendations/study-groups',
        params: { page, limit }
      }),
      transformResponse: (response: RecommendedGroupsResponse) => response.result,
      // Enable merging results for infinite scrolling
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      // Only merge if it's the same endpoint and the page has changed
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          // If it's the first page, replace the cache
          return newItems;
        }

        // For subsequent pages, append the new items
        return {
          ...newItems,
          recommended_groups: [...currentCache.recommended_groups, ...newItems.recommended_groups]
        };
      },
      // Always refetch when we have a new page value
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      }
    }),

    // Add a new endpoint for trending groups with pagination
    getTrendingGroups: builder.query<
      {
        trending_groups: StudyGroup[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      },
      PaginationParams
    >({
      query: ({ page, limit }) => ({
        url: '/recommendations/trending',
        params: { page, limit }
      }),
      transformResponse: (response: TrendingGroupsResponse) => response.result,
      // Enable merging results for infinite scrolling
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      // Only merge if it's the same endpoint and the page has changed
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          // If it's the first page, replace the cache
          return newItems;
        }

        // For subsequent pages, append the new items
        return {
          ...newItems,
          trending_groups: [...currentCache.trending_groups, ...newItems.trending_groups]
        };
      },
      // Always refetch when we have a new page value
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      }
    })
  })
});

export const {
  useLazyGetGroupUserStatsQuery,
  useGetGroupUserStatsQuery,
  useGetJoinedGroupsQuery,
  useLazyGetJoinedGroupsQuery,
  useGetRecommendedGroupsQuery,
  useLazyGetRecommendedGroupsQuery,
  useGetTrendingGroupsQuery,
  useLazyGetTrendingGroupsQuery
} = studyGroupApi;
