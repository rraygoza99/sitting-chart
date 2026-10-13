import React from 'react';
import { useSeatingTranslation } from '../../hooks/useSeatingTranslation';
import UserMenu from '../common/UserMenu';

export default function GreetingBar({ userName }) {
  const { t } = useSeatingTranslation();
  return (
    <div className="greetingBar">
      <span>{t('helloUser', { name: userName })}</span>
      <UserMenu />
    </div>
  );
}
