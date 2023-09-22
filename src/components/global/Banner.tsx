import React from 'react';
import '@/c/global/ticker.css';

const Banner = () => {
  return (
    <div className='mb-3 flex flex-col justify-between px-10 py-4 lg:flex-row '>
      <div className='w-full lg:w-1/4'>
        <h1 className='text-4xl font-bold text-untele'>
          UnTelevised Media
        </h1>
        <h2 className='mt-5 md:mt-0'>
          The Revolution will be{' '}
          <span className='font-semibold underline decoration-untele decoration-2'>
            UnTelevised
          </span>
        </h2>
      </div>
      <div className='flex w-full flex-col items-end justify-between'>
        <p className='mt-5 max-w-md text-untele md:mt-2 lg:max-w-lg'>
          The latest breaking news you wont see on mainstream media
        </p>
        <div className='w-full flex bg-static overflow-hidden rounded-md border border-untele/30 bg-slate-500 px-3 py-2 shadow-lg'>
          {/* Ticker */}

            <div className='hmove text-slate-300 text-xl font-semibold mx-2 px-2'>
              <div className='hitem'>
                DC: Proud Boys Sued For Vandalizing Black Church in DC, Leader
                Arrested;
              </div>
              <div className='hitem'>
                Chester, PA: Retired Firefighter, Who Allegedly Threw Fire
                Extinguisher at Capitol Police During D.C. Riot, Is Arrested;
              </div>
              <div className='hitem'>
                VA: 2 Virginia Police Officers Arrested for Participating in
                Capitol Riots;
              </div>
              <div className='hitem'>
                The Hill: Dozens on FBI&apos;s Terrorist Watchlist Were in DC
                Day of Capitol Riot;
              </div>
              <div className='hitem'>
                Denver, CO: Denver Police Grilled By Lawmakers Over Summer
                Protest Response;
              </div>
              <div className='hitem'>
                Wilmington, DE: Man Seen Carrying Confederate Flag in Capitol
                Arrested, IDed as Kevin Seefried, Son Hunter Also Arrested;
              </div>
              <div className='hitem'>
                Internet: Parler is Offline, but Violent Posts Scraped by
                Hackers Will Haunt Users;
              </div>
              <div className='hitem'>
                Denver, CO: Tyler Barrett May Loose Security Liscense Over
                Throwing OC Grenade At Protesters In May;
              </div>
              {/* 
              <div className='hitem'>
                Fort Worth, TX: US Air Force Veteran Lt Col Larry Randall Broke
                Jr Intended to Take Hostages with Zip Ties;
              </div>
              <div className='hitem'>
                Denver, CO: Businesses Begin to Board Up In Preparation for
                Violent Protest;
              </div>
              <div className='hitem'>
                USA: Counter-protest planned by Anti Fascist against Trump
                Insurrection in Many Major US Cities;
              </div>
              <div className='hitem'>
                DC: Death of Capitol Police Officer 3 Days After Riots Was by
                Suicide, Family Says;
              </div>
              <div className='hitem'>
                Atlanta, GA: Man Arrested Hours After Capitol Riot Dies In
                Custody;
              </div>
              <div className='hitem'>
                Unicorn Riot: &quot; It&apos;s Time to Start Killing the News
                Media Live on Air&quot;: Oath Keepers Private Chats Show
                Increased Desire for Post-Election Violence;
              </div>
              <div className='hitem'>
                AP: FBI Warns of National Protest Planned for Inauguration Day
                Across the US;
              </div>
              <div className='hitem'>
                DC: NPS Considers Closing National Mall on Inauguration Day;
              </div>
              <div className='hitem'>
                Portland, OR: Man Charged with Shooting Portland Federal
                Courthouse IDed as #StopTheSteal Attendee;
              </div>
              <div className='hitem'>
                Internet: Amazon Removes Parler from Servers, Hackers Exploit
                Failing Servers to Scrape Entire Database;
              </div>
              <div className='hitem'>
                Time: Security Officials Face the Possibility of a Threat from
                the Inside on Inauguration Day;
              </div>
              <div className='hitem'>
                FBI: Feds Report Heavy Amounts of Communications Around
                Inauguration Day Violence;
              </div>
              <div className='hitem'>
                DC: Video Shows Capitol Police Removing Fencing to Allow Right
                Wing Rioters into US Capitol;
              </div>
              <div className='hitem'>
                USA: #StopTheSteal Riots are Planned for all State Capitols on
                J20;
              </div> */}
            </div>

          {/* End Ticker */}
        </div>
      </div>
    </div>
  );
};

export default Banner;
