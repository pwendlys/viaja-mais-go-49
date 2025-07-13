
import React from 'react';
import PatientRegisterForm from '@/components/auth/PatientRegisterForm';

const PatientRegister = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-viaja-blue/10 to-viaja-green/10 p-4">
      <PatientRegisterForm />
    </div>
  );
};

export default PatientRegister;
