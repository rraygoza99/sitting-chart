import React from 'react';
import { useSeatingTranslation } from '../../hooks/useSeatingTranslation';

export default function GreetingBar({ userName }) {
  const { t } = useSeatingTranslation();
  return (
    <div className="greetingBar">
      {t('helloUser', { name: userName })}
    </div>
  );
}
