import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const IconComponent = (LucideIcons as any)[name];

  if (!IconComponent) {
    // Return a default icon or null if the name is invalid
    return <LucideIcons.HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
};
