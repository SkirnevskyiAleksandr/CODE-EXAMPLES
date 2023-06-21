import { Trans, useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { useGetCardDetailsQuery } from 'redux/api/cards/cardsApi';
import { ALoader } from 'components/ALoader/ALoader';
import { ATitle } from 'components/ATitle/ATitle';
import { CARD_SIZE_ENUM, CARD_STATUSES_ENUM, CARD_TYPES_ENUM } from 'constants/cards/cards';
import { COLOR_PALETTE } from 'constants/colors/colors';
import { CardStatement } from './CardStatement/CardStatement';
import { ICardStatementFormSheme } from './CardStatement/type';
import { StyledACard, StyledAMessage, StyledContainer } from './MyCardDetails.styles';
import { MyCardDetailsTabGroup } from './MyCardDetailsTabGroup/MyCardDetailsTabGroup';

export const MyCardDetails = () => {
  const { cardName } = useParams();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('cardId') || '';
  const cardType = searchParams.get('cardType') as CARD_TYPES_ENUM;
  const cardTypeToRequest = cardType === CARD_TYPES_ENUM.DEBIT ? CARD_TYPES_ENUM.DEPOSIT : cardType;

  const { data, isFetching, isSuccess, refetch } = useGetCardDetailsQuery({
    id,
    type: cardTypeToRequest,
  });

  const { t } = useTranslation('main');

  const translations = {
    cardName: t(`cards.my_cards.titles.${cardName}`),
    expiredWarningMessage: t('cards.my_cards.expired_warning_message'),
  };

  const viewCardStatement = (data: ICardStatementFormSheme) => {
    // TODO: change this mock function body when endpoint is ready
    return Promise.resolve();
  };

  if (isFetching) {
    return <ALoader hasBackground />;
  }

  if (isSuccess) {
    return (
      <StyledContainer>
        <ATitle
          size={24}
          lineHeight={36}
          weight={700}
          color={COLOR_PALETTE.gray900}
          marginBottom={40}
        >
          {translations.cardName}
        </ATitle>
        {data.status === CARD_STATUSES_ENUM.EXPIRED && (
          <StyledAMessage type="warning">
            <Trans>{translations.expiredWarningMessage}</Trans>
          </StyledAMessage>
        )}
        <StyledACard
          isBalanceDisplayed
          size={CARD_SIZE_ENUM.LARGE}
          {...data}
          cardType={cardType}
          cardName={data.productName}
          accountCurrencyCode={data.currencyCode}
        />
        <CardStatement onViewHandler={viewCardStatement} />
        <MyCardDetailsTabGroup refetchHandler={refetch} {...data} cardId={id} type={cardType} />
      </StyledContainer>
    );
  }

  return null;
};


file with Routes: (!мы не передаем в путь query params!)
...<Route path={CARDS} element={<CardsLayout />}>
          <Route index element={<Navigate to={MY_CARDS} replace />} />
          <Route path={MY_CARDS} element={<MyCardsLayout />}>
            <Route index element={<MyCards />} />
            <Route path=":cardName" element={<MyCardDetails />} />
          </Route>
          <Route path={CARD_PRODUCTS} element={<CardProductsLayout />}>
            <Route index element={<CardProducts />} />
            <Route path=":cardName" element={<CardProductDetails />} />
          </Route>
        </Route>


file в которм мы задаем URL(обязательно прежде чем передовать serchParams in url, их нужно закодировать через createSearchParams):
import { createSearchParams, useNavigate } from 'react-router-dom';

const navigate = useNavigate();
const showMoreDetails = () => {
    navigate({
      pathname: `${cardName}`,
      search: `?${createSearchParams({
        cardId,
        cardType,
      })}`,
    });
  };
