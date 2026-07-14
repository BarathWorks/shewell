/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useState } from 'react';

import { Button } from 'primereact/button';

import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { useForm, Controller } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import styles from './login.module.css';

const LoginPage = () => {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const error = searchParams?.get('error');

  let errorMessage: string | undefined;
  if (error && error === 'CredentialsSignin') {
    errorMessage = 'Invalid email or password';
  }
  const { control, handleSubmit } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const router = useRouter();

  const loginSubmit = ({ username, password }: { username: string; password: string }) => {
    setIsLoading(true);
    signIn('credentials', { username, password, callbackUrl: '/' }).then(
      (success) => {
        setIsLoading(false);
        router.push('/');
      },
      (err) => {
        setIsLoading(false);
      }
    );
  };

  return (
    <div className={styles.container}>
      <div className="flex flex-column align-items-center justify-content-center">
        <img src={`/layout/images/vyan-logo.png`} alt="Flexit Logo" className="mb-5 w-12rem flex-shrink-0" />
        <div className={styles.loginCard}>
          <div className={styles.titleContainer}>
            <span className={styles.subtitle}>Sign in to continue</span>
          </div>
          <form onSubmit={handleSubmit(loginSubmit)}>
            {errorMessage && (
              <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 mb-4" role="alert">
                <span className="block sm:inline">{errorMessage}</span>
              </div>
            )}
            <label htmlFor="email1" className={styles.label}>
              Email
            </label>
            <Controller
              name="username"
              control={control}
              rules={{
                required: {
                  value: true,
                  message: 'Email is required.'
                }
              }}
              render={({ field, fieldState }) => {
                return (
                  <div className="w-full mb-4">
                    <InputText
                      type="email"
                      placeholder="Email address"
                      className={`${styles.inputField} w-full`}
                      {...field}
                    />
                    {fieldState.error && <small className="p-error block mt-1">{fieldState.error.message}</small>}
                  </div>
                );
              }}
            />

            <label htmlFor="password1" className={styles.label}>
              Password
            </label>
            <Controller
              name="password"
              control={control}
              rules={{
                required: {
                  value: true,
                  message: 'Password is required.'
                }
              }}
              render={({ field, fieldState }) => {
                return (
                  <div className="w-full mb-4">
                    <Password
                      feedback={false}
                      placeholder="Password"
                      toggleMask
                      className="w-full"
                      inputClassName={`${styles.inputField} w-full`}
                      {...field}
                    />
                    {fieldState.error && <small className="p-error block mt-1">{fieldState.error.message}</small>}
                  </div>
                );
              }}
            />
            <div className="flex align-items-center justify-content-between mb-4 gap-5">
              <Link href="/auth/forget-password" className={styles.forgotPasswordLink}>
                Forgot password?
              </Link>
            </div>
            <Button type="submit" loading={isLoading} label="Sign In" className={styles.submitButton}></Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
