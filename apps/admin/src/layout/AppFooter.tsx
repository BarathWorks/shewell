/* eslint-disable @next/next/no-img-element */

import React from 'react';
import Link from 'next/link';

const AppFooter = () => {
  return (
    <div className="layout-footer">
      <img src={`/layout/images/vyan-logo.png`} alt="Logo" height="20" className="mr-2" />
    </div>
  );
};

export default AppFooter;
