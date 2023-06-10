import { MouseEvent } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ReactComponent as IconBack } from 'assets/icons/back_icon.svg';
import { ReactComponent as IconCross } from 'assets/icons/cross_icon.svg';
import { BackButton, CloseButton, StyledContainer, StyledCover } from './ModalWindow.styles';
import { ModalWindowProps } from './type';

export const ModalWindow = ({
  children,
  onCloseHandler,
  onBackHandler,
  hasBackground = false,
  className,
  isScroll = false,
}: ModalWindowProps) => {
  const { t } = useTranslation();

  const translations = {
    back: t('buttons.back'),
  };

  const onClose = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    if (e.target === e.currentTarget) onCloseHandler?.();
  };

  const createWrapper = () => (
    <StyledContainer
      className={className}
      flexDirection="column"
      alignItems="flex-start"
      isScroll={isScroll}
    >
      {onBackHandler && (
        <BackButton onClick={onBackHandler} data-testid="modalBackButton">
          <IconBack />
          {translations.back}
        </BackButton>
      )}
      {onCloseHandler && (
        <CloseButton onClick={onClose} data-testid="modalCloseButton">
          <IconCross />
        </CloseButton>
      )}
      {children}
    </StyledContainer>
  );

  return hasBackground
    ? ReactDOM.createPortal(
        <StyledCover onClick={onClose}>{createWrapper()}</StyledCover>,
        document.getElementById('root') as HTMLElement,
      )
    : createWrapper();
};
