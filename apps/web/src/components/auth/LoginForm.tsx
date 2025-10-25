'use client';



import Image from 'next/image';

import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from '../../contexts/AuthContext';

import { motion } from 'framer-motion';

import { Button } from '../ui/Button';

import { FormError } from '../ui/FormError';

import { useToast } from '../ui/Toast';



type SocialProvider = 'google' | 'facebook';



type SocialIconConfig = {

  alt: string;

  src: string;

  width: number;

  height: number;

};



const SOCIAL_ICONS: Record<SocialProvider, SocialIconConfig> = {

  google: { src: '/google.svg', alt: 'Google', width: 20, height: 20 },

  facebook: { src: '/facebook.svg', alt: 'Facebook', width: 20, height: 20 },

};



const PLACEHOLDER_PASSWORD = 'â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢';



export const LoginForm: React.FC = () => {

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const [rememberMe, setRememberMe] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [isClient, setIsClient] = useState(false);



  const { login } = useAuth();

  const router = useRouter();

  const { showToast } = useToast();



  useEffect(() => {

    setIsClient(true);

  }, []);



  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    setLoading(true);

    setErrorMessage('');



    if (!email.trim()) {

      setErrorMessage('Ð£ÐºÐ°Ð¶Ð¸Ñ‚Ðµ email.');

      showToast('error', 'Ð£ÐºÐ°Ð¶Ð¸Ñ‚Ðµ email.');

      setLoading(false);

      return;

    }



    if (!password.trim()) {

      setErrorMessage('Ð’Ð²ÐµÐ´Ð¸Ñ‚Ðµ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ.');

      showToast('error', 'Ð’Ð²ÐµÐ´Ð¸Ñ‚Ðµ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ.');

      setLoading(false);

      return;

    }



    try {

      const result = await login(email, password);

      if (!result.success) {

        const message = result.message ?? '???????? e-mail ??? ??????.';

        setErrorMessage(message);

        showToast('error', message);

        return;

      }



      if (rememberMe) {

        localStorage.setItem('rememberMe', 'true');

      }



      setErrorMessage('');

      showToast('success', '???? ???????? ???????!');

      router.push('/dashboard');

    } catch (error) {

      const message = error instanceof Error ? error.message : 'ÐÐµ ÑƒÐ´Ð°Ð»Ð¾ÑÑŒ Ð²Ñ‹Ð¿Ð¾Ð»Ð½Ð¸Ñ‚ÑŒ Ð²Ñ…Ð¾Ð´. ÐŸÐ¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹Ñ‚Ðµ Ð¿Ð¾Ð·Ð¶Ðµ.';

      setErrorMessage(message);

      showToast('error', message);

    } finally {

      setLoading(false);

    }

  };



  const renderSocialButton = (provider: SocialProvider, label: string) => (

    <motion.button

      whileHover={{ scale: 1.02 }}

      whileTap={{ scale: 0.98 }}

      type="button"

      className="flex items-center justify-center space-x-2 rounded-lg border border-gray-200 bg-white py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"

    >

      <Image {...SOCIAL_ICONS[provider]} />

      <span>{label}</span>

    </motion.button>

  );



  if (!isClient) {

    return (

      <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl flex items-center justify-center">

          <div className="text-center">

            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>

            <p className="mt-2 text-gray-600">Ð—Ð°Ð³Ñ€ÑƒÐ·ÐºÐ°...</p>

          </div>

        </div>

      </div>

    );

  }



  return (

    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        <div className="grid gap-10 lg:grid-cols-[2fr,420px] lg:items-center">

          <motion.div 

            initial={{ opacity: 0, x: -20 }}

            animate={{ opacity: 1, x: 0 }}

            transition={{ duration: 0.5 }}

            className="relative hidden overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 lg:flex"

          >

            <div className="absolute inset-0 opacity-90" />

            <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">

              <div>

                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium">

                  ConsciousFunnels Â· AI CRM

                </span>

                <h1 className="mt-8 text-4xl font-semibold leading-snug">

                  Ð­Ð¼Ð¿Ð°Ñ‚Ð¸Ñ‡Ð½Ñ‹Ð¹ AI Ð¿Ð¾Ð¼Ð¾Ð³Ð°ÐµÑ‚ Ð·Ð°ÐºÑ€Ñ‹Ð²Ð°Ñ‚ÑŒ ÑÐ´ÐµÐ»ÐºÐ¸ Ð±Ñ‹ÑÑ‚Ñ€ÐµÐµ

                </h1>

                <p className="mt-5 text-base text-indigo-100/90">

                  ÐžÑ‚ Ð¾Ñ‚ÑÐ»ÐµÐ¶Ð¸Ð²Ð°Ð½Ð¸Ñ ÑÐ¼Ð¾Ñ†Ð¸Ð¹ Ð´Ð¾ Ð°Ð²Ñ‚Ð¾Ð¼Ð°Ñ‚Ð¸Ð·Ð°Ñ†Ð¸Ð¸ follow-up â€” Ð¼Ñ‹ ÑÐ¾Ð·Ð´Ð°Ñ‘Ð¼ Ð²Ð¾Ñ€Ð¾Ð½ÐºÐ¸, ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ðµ Ñ€ÐµÐ·Ð¾Ð½Ð¸Ñ€ÑƒÑŽÑ‚ Ñ ÐºÐ»Ð¸ÐµÐ½Ñ‚Ð°Ð¼Ð¸.

                </p>

              </div>



              <dl className="grid gap-4 text-sm text-indigo-50/90">

                <motion.div 

                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.2 }}

                  className="flex items-start space-x-3"

                >

                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">ðŸ”</span>

                  <div>

                    <dt className="font-medium">ÐŸÑ€Ð¾Ð·Ñ€Ð°Ñ‡Ð½Ð°Ñ Ð°Ð½Ð°Ð»Ð¸Ñ‚Ð¸ÐºÐ° ÑÐ¼Ð¾Ñ†Ð¸Ð¹</dt>

                    <dd>ÐŸÐ¾Ð½Ð¸Ð¼Ð°Ð¹Ñ‚Ðµ, ÐºÐ°ÐºÐ¸Ðµ ÑÐ¼Ð¾Ñ†Ð¸Ð¸ Ð²ÐµÐ´ÑƒÑ‚ Ðº ÐºÐ¾Ð½Ð²ÐµÑ€ÑÐ¸Ð¸ Ð½Ð° ÐºÐ°Ð¶Ð´Ð¾Ð¼ ÑˆÐ°Ð³Ðµ.</dd>

                  </div>

                </motion.div>

                <motion.div 

                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.4 }}

                  className="flex items-start space-x-3"

                >

                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">âš¡</span>

                  <div>

                    <dt className="font-medium">AI follow-up</dt>

                    <dd>ÐÐ²Ñ‚Ð¾Ð¼Ð°Ñ‚Ð¸Ñ‡ÐµÑÐºÐ¸Ðµ Ð¿Ð¾Ð´ÑÐºÐ°Ð·ÐºÐ¸ Ð¸ Ð¿Ð¸ÑÑŒÐ¼Ð°, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð½Ð¸ Ð¾Ð´Ð¸Ð½ Ð»Ð¸Ð´ Ð½Ðµ Â«Ð¾ÑÑ‚Ñ‹Ð»Â».</dd>

                  </div>

                </motion.div>

                <motion.div 

                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.6 }}

                  className="flex items-start space-x-3"

                >

                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">ðŸ§ </span>

                  <div>

                    <dt className="font-medium">ÐžÑÐ¾Ð·Ð½Ð°Ð½Ð½Ñ‹Ð¹ Ð¿Ð¾Ð´Ñ…Ð¾Ð´</dt>

                    <dd>Ð ÐµÐºÐ¾Ð¼ÐµÐ½Ð´Ð°Ñ†Ð¸Ð¸ Ð¿Ð¾ Ñ‚Ð¾Ð½Ñƒ Ð¾Ð±Ñ‰ÐµÐ½Ð¸Ñ Ð´Ð»Ñ ÐºÐ°Ð¶Ð´Ð¾Ð³Ð¾ ÑÐµÐ³Ð¼ÐµÐ½Ñ‚Ð° ÐºÐ»Ð¸ÐµÐ½Ñ‚Ð¾Ð².</dd>

                  </div>

                </motion.div>

              </dl>

            </div>

          </motion.div>



          <motion.div 

            initial={{ opacity: 0, x: 20 }}

            animate={{ opacity: 1, x: 0 }}

            transition={{ duration: 0.5 }}

            className="flex justify-center lg:justify-end"

          >

            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl sm:p-10">

              <div className="mb-8 text-center lg:hidden">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-2xl text-white">

                  ðŸ”

                </div>

                <motion.h2 

                  initial={{ opacity: 0, y: -10 }}

                  animate={{ opacity: 1, y: 0 }}

                  className="mt-4 text-2xl font-semibold text-gray-900"

                >

                  Ð”Ð¾Ð±Ñ€Ð¾ Ð¿Ð¾Ð¶Ð°Ð»Ð¾Ð²Ð°Ñ‚ÑŒ!

                </motion.h2>

                <p className="mt-2 text-sm text-gray-600">

                  Ð’Ð¾Ð¹Ð´Ð¸Ñ‚Ðµ, Ñ‡Ñ‚Ð¾Ð±Ñ‹ ÑƒÐ²Ð¸Ð´ÐµÑ‚ÑŒ Ð¿ÐµÑ€ÑÐ¾Ð½Ð°Ð»Ð¸Ð·Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½ÑƒÑŽ Ð¿Ð°Ð½ÐµÐ»ÑŒ Ð¾ÑÐ¾Ð·Ð½Ð°Ð½Ð½Ñ‹Ñ… Ð¿Ñ€Ð¾Ð´Ð°Ð¶.

                </p>

              </div>



              <form className="space-y-6" onSubmit={handleSubmit}>

                <motion.div

                  initial={{ opacity: 0, y: 10 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.1 }}

                >

                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">

                    Email

                  </label>

                  <input

                    id="email"

                    name="email"

                    type="email"

                    autoComplete="email"

                    className="block w-full rounded-lg border border-gray-300 py-3 px-3 placeholder-gray-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"

                    placeholder="you@company.com"

                    value={email}

                    onChange={(event) => setEmail(event.target.value)}

                    required

                  />

                  <FormError message={errorMessage && !email.trim() ? 'Ð£ÐºÐ°Ð¶Ð¸Ñ‚Ðµ email.' : undefined} />

                </motion.div>



                <motion.div

                  initial={{ opacity: 0, y: 10 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.2 }}

                >

                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">

                    ÐŸÐ°Ñ€Ð¾Ð»ÑŒ

                  </label>

                  <div className="relative">

                    <input

                      id="password"

                      name="password"

                      type={showPassword ? 'text' : 'password'}

                      autoComplete="current-password"

                      className="block w-full rounded-lg border border-gray-300 py-3 pl-3 pr-12 placeholder-gray-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"

                      placeholder={PLACEHOLDER_PASSWORD}

                      value={password}

                      onChange={(event) => setPassword(event.target.value)}

                      required

                    />

                    <button

                      type="button"

                      aria-label={showPassword ? 'Ð¡ÐºÑ€Ñ‹Ñ‚ÑŒ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ' : 'ÐŸÐ¾ÐºÐ°Ð·Ð°Ñ‚ÑŒ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ'}

                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition hover:text-gray-600"

                      onClick={() => setShowPassword((prev) => !prev)}

                    >

                      {showPassword ? (

                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M3 3l6.878 6.878L21 21" />

                        </svg>

                      ) : (

                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />

                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />

                        </svg>

                      )}

                    </button>

                  </div>

                  <FormError message={errorMessage && !password.trim() ? 'Ð’Ð²ÐµÐ´Ð¸Ñ‚Ðµ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ.' : undefined} />

                </motion.div>



                <motion.div

                  initial={{ opacity: 0, y: 10 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.3 }}

                  className="flex items-center justify-between text-sm"

                >

                  <label className="flex items-center space-x-2">

                    <input

                      id="remember-me"

                      name="remember-me"

                      type="checkbox"

                      checked={rememberMe}

                      onChange={(event) => setRememberMe(event.target.checked)}

                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"

                    />

                    <span className="text-gray-700">Ð—Ð°Ð¿Ð¾Ð¼Ð½Ð¸Ñ‚ÑŒ Ð¼ÐµÐ½Ñ</span>

                  </label>

                  <a href="/auth/forgot-password" className="font-medium text-indigo-600 transition-colors hover:text-indigo-500">

                    Ð—Ð°Ð±Ñ‹Ð»Ð¸ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ?

                  </a>

                </motion.div>



                <FormError message={errorMessage} />



                <Button 

                  type="submit" 

                  variant="primary" 

                  className="w-full" 

                  loading={loading}

                  disabled={loading}

                >

                  Ð’Ð¾Ð¹Ñ‚Ð¸

                </Button>



                <div className="relative my-6">

                  <div className="absolute inset-0 flex items-center" aria-hidden="true">

                    <div className="w-full border-t border-gray-200" />

                  </div>

                  <div className="relative flex justify-center text-sm">

                    <span className="bg-white px-2 text-gray-500">Ð˜Ð»Ð¸ Ð²Ð¾Ð¹Ð´Ð¸Ñ‚Ðµ Ñ Ð¿Ð¾Ð¼Ð¾Ñ‰ÑŒÑŽ</span>

                  </div>

                </div>



                <motion.div

                  initial={{ opacity: 0, y: 10 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.5 }}

                  className="grid grid-cols-2 gap-3"

                >

                  {renderSocialButton('google', 'Google')}

                  {renderSocialButton('facebook', 'Facebook')}

                </motion.div>



                <motion.div

                  initial={{ opacity: 0, y: 10 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.6 }}

                  className="text-center"

                >

                  <p className="text-sm text-gray-600">

                    ÐÐµÑ‚ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚Ð°?{' '}

                    <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">

                      Ð—Ð°Ñ€ÐµÐ³Ð¸ÑÑ‚Ñ€Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒÑÑ Ð±ÐµÑÐ¿Ð»Ð°Ñ‚Ð½Ð¾

                    </a>

                  </p>

                </motion.div>

              </form>

            </div>

          </motion.div>

        </div>

      </div>

    </div>

  );

};
