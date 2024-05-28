import { sequence } from '@sveltejs/kit/hooks';

const customHandle = async ({ event, resolve }) => {
  const url = new URL(event.request.url);
  console.log('url', url);
  const pathname = url.pathname;
  console.log('pathname', pathname);

  // Check if the pathname starts with a number followed by a hyphen
  if (/^\/\d+-/.test(pathname)) {
    // Remove the number and hyphen from the pathname
    const modifiedPathname = pathname.replace(/^\/\d+-/, '/');
    console.log('modifiedPathname', modifiedPathname);
    url.pathname = modifiedPathname;
    event.url = url;
  }

  return resolve(event);
};

export const handle = sequence(customHandle);