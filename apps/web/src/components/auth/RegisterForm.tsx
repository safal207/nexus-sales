'use client';



import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from '../../contexts/AuthContext';

import { motion } from 'framer-motion';

import { Button } from '../ui/Button';

import { FormError } from '../ui/FormError';

import { useToast } from '../ui/Toast';



const MIN_PASSWORD_LENGTH = 8;

const PLACEHOLDER_PASSWORD = 'Ð’Ð²ÐµÐ´Ð¸Ñ‚Ðµ Ð½Ðµ Ð¼ÐµÐ½ÐµÐµ 8 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð²';



export const RegisterForm: React.FC = () => {

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const [isClient, setIsClient] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(0);



  const { register } = useAuth();

  const router = useRouter();

  const { showToast } = useToast();



  useEffect(() => {

    setIsClient(true);

  }, []);



  // Calculate password strength

  useEffect(() => {

    let strength = 0;

    if (password.length >= 8) strength += 1;

    if (/[A-Z]/.test(password)) strength += 1;

    if (/[0-9]/.test(password)) strength += 1;

    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(Math.min(strength, 4));

  }, [password]);



  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    setLoading(true);

    setErrorMessage('');



    if (password !== confirmPassword) {

      setErrorMessage('ÐŸÐ°Ñ€Ð¾Ð»Ð¸ Ð½Ðµ ÑÐ¾Ð²Ð¿Ð°Ð´Ð°ÑŽÑ‚.');

      showToast('error', 'ÐŸÐ°Ñ€Ð¾Ð»Ð¸ Ð½Ðµ ÑÐ¾Ð²Ð¿Ð°Ð´Ð°ÑŽÑ‚.');

      setLoading(false);

      return;

    }



    if (password.length < MIN_PASSWORD_LENGTH) {

      setErrorMessage('ÐŸÐ°Ñ€Ð¾Ð»ÑŒ Ð´Ð¾Ð»Ð¶ÐµÐ½ ÑÐ¾Ð´ÐµÑ€Ð¶Ð°Ñ‚ÑŒ Ð¼Ð¸Ð½Ð¸Ð¼ÑƒÐ¼ 8 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð².');

      showToast('error', 'ÐŸÐ°Ñ€Ð¾Ð»ÑŒ Ð´Ð¾Ð»Ð¶ÐµÐ½ ÑÐ¾Ð´ÐµÑ€Ð¶Ð°Ñ‚ÑŒ Ð¼Ð¸Ð½Ð¸Ð¼ÑƒÐ¼ 8 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð².');

      setLoading(false);

      return;

    }



    try {

      const result = await register(email, password);

      if (!result.success) {

        const message = result.message ?? '???????????? ? ????? e-mail ??? ??????????.';

        setErrorMessage(message);

        showToast('error', message);

        return;

      }



      setErrorMessage('');

      showToast('success', '??????????? ?????? ???????!');

      router.push('/dashboard');

    } catch (error) {

      const message = error instanceof Error ? error.message : 'ÐÐµ ÑƒÐ´Ð°Ð»Ð¾ÑÑŒ ÑÐ¾Ð·Ð´Ð°Ñ‚ÑŒ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚. ÐŸÐ¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹Ñ‚Ðµ Ð¿Ð¾Ð·Ð¶Ðµ.';

      setErrorMessage(message);

      showToast('error', message);

    } finally {

      setLoading(false);

    }

  };



  if (!isClient) {

    return (

      <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl flex items-center justify-center">

          <div className="text-center">

            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>

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

            className="relative hidden overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-blue-500 to-indigo-600 lg:flex"

          >

            <div className="absolute inset-0 opacity-90" />

            <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">

              <div>

                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium">

                  ConsciousFunnels Â· Growth AI

                </span>

                <h1 className="mt-8 text-4xl font-semibold leading-snug">

                  ÐŸÐ¾ÑÑ‚Ñ€Ð¾Ð¹Ñ‚Ðµ Ð¾ÑÐ¾Ð·Ð½Ð°Ð½Ð½ÑƒÑŽ Ð²Ð¾Ñ€Ð¾Ð½ÐºÑƒ Ñ Ð¿Ð¾Ð´Ð´ÐµÑ€Ð¶ÐºÐ¾Ð¹ AI

                </h1>

                <p className="mt-5 text-base text-green-50/90">

                  Ð¨Ð°Ð±Ð»Ð¾Ð½Ñ‹, Ð°Ð½Ð°Ð»Ð¸Ñ‚Ð¸ÐºÐ° ÑÐ¼Ð¾Ñ†Ð¸Ð¹ Ð¸ ÑÑ†ÐµÐ½Ð°Ñ€Ð¸Ð¸ follow-up â€” Ð²ÑÑ‘, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð²Ð°ÑˆÐ¸ ÐºÐ¾Ð¼Ð¼ÑƒÐ½Ð¸ÐºÐ°Ñ†Ð¸Ð¸ Ð±Ñ‹Ð»Ð¸ Ñ‚Ð¾Ñ‡Ð½Ñ‹Ð¼Ð¸ Ð¸ Ñ‡ÐµÐ»Ð¾Ð²ÐµÑ‡Ð½Ñ‹Ð¼Ð¸.

                </p>

              </div>



              <dl className="grid gap-4 text-sm text-green-50/90">

                <motion.div

                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.2 }}

                  className="flex items-start space-x-3"

                >

                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">ðŸ§­</span>

                  <div>

                    <dt className="font-medium">ÐŸÑ€Ð¾Ð·Ñ€Ð°Ñ‡Ð½Ð°Ñ Ð°Ð½Ð°Ð»Ð¸Ñ‚Ð¸ÐºÐ°</dt>

                    <dd>Ð’Ð¸Ð´Ð¸Ñ‚Ðµ, ÐºÐ°ÐºÐ°Ñ ÑÐ¼Ð¾Ñ†Ð¸Ð¾Ð½Ð°Ð»ÑŒÐ½Ð°Ñ Ð´Ð¸Ð½Ð°Ð¼Ð¸ÐºÐ° Ð²ÐµÐ´Ñ‘Ñ‚ Ðº ÑÐ´ÐµÐ»ÐºÐ°Ð¼.</dd>

                  </div>

                </motion.div>

                <motion.div

                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.4 }}

                  className="flex items-start space-x-3"

                >

                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">âš™ï¸</span>

                  <div>

                    <dt className="font-medium">Ð¦ÐµÐ¿Ð¾Ñ‡ÐºÐ¸ nurturing</dt>

                    <dd>ÐÐ²Ñ‚Ð¾Ð¼Ð°Ñ‚Ð¸Ñ‡ÐµÑÐºÐ¸Ðµ Ð¿Ð¾Ð´ÑÐºÐ°Ð·ÐºÐ¸ Ð¸ Ð¿Ð¸ÑÑŒÐ¼Ð° Ð¿Ð¾Ð´ ÑÐ¼Ð¾Ñ†Ð¸Ð¸ ÐºÐ»Ð¸ÐµÐ½Ñ‚Ð°.</dd>

                  </div>

                </motion.div>

                <motion.div

                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.6 }}

                  className="flex items-start space-x-3"

                >

                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">ðŸš€</span>

                  <div>

                    <dt className="font-medium">Ð‘Ñ‹ÑÑ‚Ñ€Ñ‹Ð¹ ÑÑ‚Ð°Ñ€Ñ‚</dt>

                    <dd>Ð‘ÐµÑÐ¿Ð»Ð°Ñ‚Ð½Ñ‹Ð¹ Ñ‚Ð°Ñ€Ð¸Ñ„ Ð¸ Ð³Ð¾Ñ‚Ð¾Ð²Ñ‹Ðµ ÑÑ†ÐµÐ½Ð°Ñ€Ð¸Ð¸ Ð´Ð»Ñ Ð¿ÐµÑ€Ð²Ñ‹Ñ… ÐºÐ»Ð¸ÐµÐ½Ñ‚Ð¾Ð².</dd>

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

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-500 text-2xl text-white">

                  âœ¨

                </div>

                <motion.h2

                  initial={{ opacity: 0, y: -10 }}

                  animate={{ opacity: 1, y: 0 }}

                  className="mt-4 text-2xl font-semibold text-gray-900"

                >

                  Ð¡Ð¾Ð·Ð´Ð°Ð¹Ñ‚Ðµ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚

                </motion.h2>

                <p className="mt-2 text-sm text-gray-600">

                  ÐŸÐ¾Ð´Ð±ÐµÑ€Ð¸Ñ‚Ðµ email Ð¸ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ â€” Ð¸ Ð½Ð°Ñ‡Ð½Ð¸Ñ‚Ðµ ÑÐ¾Ð±Ð¸Ñ€Ð°Ñ‚ÑŒ Ð¾ÑÐ¾Ð·Ð½Ð°Ð½Ð½Ñ‹Ðµ Ð²Ð¾Ñ€Ð¾Ð½ÐºÐ¸ Ñ ÑÐ¼Ð¿Ð°Ñ‚Ð¸Ñ‡Ð½Ñ‹Ð¼ AI.

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

                  <div className="relative">

                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">

                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />

                      </svg>

                    </div>

                    <input

                      id="email"

                      name="email"

                      type="email"

                      autoComplete="email"

                      required

                      className="block w-full rounded-lg border border-gray-300 py-3 pl-12 pr-3 placeholder-gray-500 transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"

                      placeholder="you@company.com"

                      value={email}

                      onChange={(event) => setEmail(event.target.value)}

                    />

                  </div>

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

                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">

                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />

                      </svg>

                    </div>

                    <input

                      id="password"

                      name="password"

                      type="password"

                      autoComplete="new-password"

                      required

                      className="block w-full rounded-lg border border-gray-300 py-3 pl-12 pr-3 placeholder-gray-500 transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"

                      placeholder={PLACEHOLDER_PASSWORD}

                      value={password}

                      onChange={(event) => setPassword(event.target.value)}

                    />

                  </div>

                  <p className="mt-1 text-xs text-gray-500">ÐŸÐ°Ñ€Ð¾Ð»ÑŒ Ð´Ð¾Ð»Ð¶ÐµÐ½ ÑÐ¾Ð´ÐµÑ€Ð¶Ð°Ñ‚ÑŒ Ð¼Ð¸Ð½Ð¸Ð¼ÑƒÐ¼ {MIN_PASSWORD_LENGTH} ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð².</p>



                  {/* Password strength indicator */}

                  <div className="mt-2">

                    <div className="flex items-center justify-between">

                      <span className="text-xs text-gray-500">Ð¡Ð»Ð¾Ð¶Ð½Ð¾ÑÑ‚ÑŒ Ð¿Ð°Ñ€Ð¾Ð»Ñ:</span>

                      <span className="text-xs font-medium">

                        {passwordStrength === 0 && 'ÐžÑ‡ÐµÐ½ÑŒ ÑÐ»Ð°Ð±Ñ‹Ð¹'}

                        {passwordStrength === 1 && 'Ð¡Ð»Ð°Ð±Ñ‹Ð¹'}

                        {passwordStrength === 2 && 'Ð¡Ñ€ÐµÐ´Ð½Ð¸Ð¹'}

                        {passwordStrength === 3 && 'Ð¥Ð¾Ñ€Ð¾ÑˆÐ¸Ð¹'}

                        {passwordStrength === 4 && 'ÐžÑ‡ÐµÐ½ÑŒ Ñ…Ð¾Ñ€Ð¾ÑˆÐ¸Ð¹'}

                      </span>

                    </div>

                    <div className="mt-1 flex space-x-1">

                      {[1, 2, 3, 4].map((level) => (

                        <div

                          key={level}

                          className={`flex-1 h-1.5 rounded-full ${

                            level <= passwordStrength ? 

                            (passwordStrength < 2 ? 'bg-red-500' : passwordStrength < 3 ? 'bg-yellow-500' : passwordStrength < 4 ? 'bg-blue-500' : 'bg-green-500') : 

                            'bg-gray-200'

                          }`}

                        ></div>

                      ))}

                    </div>

                  </div>

                  <FormError message={errorMessage && !password.trim() ? 'Ð’Ð²ÐµÐ´Ð¸Ñ‚Ðµ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ.' : undefined} />

                </motion.div>



                <motion.div

                  initial={{ opacity: 0, y: 10 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.3 }}

                >

                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">

                    ÐŸÐ¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð¸Ðµ Ð¿Ð°Ñ€Ð¾Ð»Ñ

                  </label>

                  <div className="relative">

                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">

                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />

                      </svg>

                    </div>

                    <input

                      id="confirmPassword"

                      name="confirmPassword"

                      type="password"

                      autoComplete="new-password"

                      required

                      className="block w-full rounded-lg border border-gray-300 py-3 pl-12 pr-3 placeholder-gray-500 transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"

                      placeholder="ÐŸÐ¾Ð²Ñ‚Ð¾Ñ€Ð¸Ñ‚Ðµ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ"

                      value={confirmPassword}

                      onChange={(event) => setConfirmPassword(event.target.value)}

                    />

                  </div>

                  <FormError message={errorMessage && !confirmPassword.trim() ? 'ÐŸÐ¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ñ‚Ðµ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ.' : undefined} />

                </motion.div>



                <FormError message={errorMessage} />



                <Button 

                  type="submit" 

                  variant="primary" 

                  className="w-full" 

                  loading={loading}

                  disabled={loading}

                >

                  Ð—Ð°Ñ€ÐµÐ³Ð¸ÑÑ‚Ñ€Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒÑÑ

                </Button>



                <motion.div

                  initial={{ opacity: 0, y: 10 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.5 }}

                  className="text-center text-sm text-gray-600 lg:text-left"

                >

                  Ð£Ð¶Ðµ ÐµÑÑ‚ÑŒ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚?{' '}

                  <a href="/login" className="font-medium text-green-600 transition-colors hover:text-green-500">

                    Ð’Ð¾Ð¹Ñ‚Ð¸

                  </a>

                </motion.div>

              </form>

            </div>

          </motion.div>

        </div>

      </div>

    </div>

  );

};

