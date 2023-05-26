import { BaseQueryFn, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from 'redux/store';
import { refreshTokensThunk } from 'redux/userDataSlice/userDataSlice';
import { BaseURL } from 'components/Header/BackEndSwitcher/type';
import { RESPONSE_CODES_ENUM } from 'constants/responseCodes/responseCodes';
import { getFromLocalStorage } from 'utils/getFromLocalStorage/getFromLocalStorage';

базовый запрос с использованием fetchBaseQuery(дефольная функция RTKQuery), данный запрост, проверяет, есть ли accestoken in redux, если есть, то 
отправляет запрос с ним, если нет, то толлько с заголовками.
const baseQuery = fetchBaseQuery({
  baseUrl: getFromLocalStorage('baseURL', BaseURL.java),
  prepareHeaders: (headers, { getState }) => {
    const { accessToken } = (getState() as RootState).user;

    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`);
    }

    return headers;
  },
});

если мы получаем ошибку 401(не правильный аксесстокен, то берем наш рефрештокен и отправляем запрос, тем самым, обновляя аксес на основании рефреш токена)
const baseQueryWithReAuth: BaseQueryFn = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === RESPONSE_CODES_ENUM.UNAUTHORIZED) {
    const { refreshToken } = (api.getState() as RootState).user;

    if (refreshToken) {
      await api.dispatch(refreshTokensThunk(refreshToken));

      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};


создаем базовый обьект для TRKQuery
export const apiSlice = createApi({
  baseQuery: baseQueryWithReAuth,
  endpoints: builder => ({}),
  tagTypes: ['generalInfo', 'notificationSettings'],
});


файл с запросами, в котором мы уже используем  наш базовый обьект - apiSlice
import { apiSlice } from 'redux/api/apiSlice';
import {
  ICardStatusSwitcherProps,
  ICardStatusSwitcherResponse,
} from 'routes/Main/Cards/MyCards/MyCardDetails/MyCardDetailsTabGroup/Tabs/ManageTab/Parts/CardStatusSwitcher/type';
import { ILoanProductsList } from 'routes/Main/Loans/LoanProducts/type';
import { CARD_TYPES_ENUM } from 'constants/cards/cards';
import { ICardProductsList, IMyCardDetails, IMyCardsList } from './type';

export const cardsApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getCreditCards: builder.query<IMyCardsList, void>({
      query: () => '/credit-cards',
    }),
    getDebitCards: builder.query<IMyCardsList, void>({
      query: () => '/deposit-cards',
    }),
    getCardDetails: builder.query<IMyCardDetails, { id: string; type: CARD_TYPES_ENUM }>({
      query: ({ id, type }) => `/${type.toLowerCase()}-cards/${id}`,
    }),
    getCardProducts: builder.query<ICardProductsList, void>({
      query: () => '/cards-products',
    }),
    getLoanProducts: builder.query<ILoanProductsList, void>({
      query: () => '/credit-products',
    }),

    updateCardStatus: builder.mutation<ICardStatusSwitcherResponse, ICardStatusSwitcherProps>({
      query: ({ cardId, currentStatus }) => ({
        url: `deposit-cards/${cardId}`,
        method: 'PATCH',
        body: currentStatus,
      }),
    }),
  }),
});
хуки, которые 
export const {
  useGetCreditCardsQuery,
  useGetDebitCardsQuery,
  useGetCardProductsQuery,
  useGetCardDetailsQuery,
  useGetLoanProductsQuery,   (getLoanProducts)
  useUpdateCardStatusMutation,  (updateCardStatus)
} = cardsApi;

файл с STORE:
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { apiSlice } from './api/apiSlice';
import userDataSlice from './userDataSlice/userDataSlice';

осздаем комбайнредюсер, в кторый ложем наши два редьюсера (два разных state), 
указываем, что это обьект с полями: user and динамическое поле, для RTKQuery, которое берем из reducerPath.
т.е. к значению в  "user" мы будем обращаться как state.user.somefield
export const rootReducer = combineReducers({

  user: userDataSlice,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootReducer = ReturnType<typeof rootReducer>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;


файл, с компонентом, в которм вызывается хук
const [updateUser, { data, isLoading, isError }] = useUpdateCardStatusMutation();

