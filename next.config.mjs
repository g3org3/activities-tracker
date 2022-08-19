// import { env } from "./src/env/server.mjs";
import withPWA from 'next-pwa'

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return config;
}

export default  withPWA(defineNextConfig({
  reactStrictMode: true,
  swcMinify: true,
  pwa: {
    dest: 'public',
    register: true, 
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
  }
}))