import type { Metadata } from 'next';
import Link from 'next/link';
import PrintButton from '@/components/print-button';

export const metadata: Metadata = {
  title: 'Help guide · Screen Time Control',
  description: 'How to set up and use Screen Time Control: add children, set daily limits, run the timer and review history.',
};

// Shown to buyers in the guide. Change it here and in the PDF (regenerate) if it ever moves.
const SUPPORT_EMAIL = 'support@mzdigitalbuys.com';

const toc: [string, string][] = [
  ['quick-start', 'Quick start (5 steps)'],
  ['what-it-does', 'What the app does, and what it does not'],
  ['install', 'Put it on your phone'],
  ['account', 'Create your account and sign in'],
  ['children', 'Add a child and set the daily limit'],
  ['timer', 'Track screen time with the timer'],
  ['limit', 'What happens at the daily limit'],
  ['reminders', 'Reminders'],
  ['phone-alerts', 'Phone alerts (when the app is closed)'],
  ['manual', 'Log a session after the fact'],
  ['history', 'Session history: edit and delete'],
  ['dashboard', 'Reading the dashboard'],
  ['content-safe', 'Keeping content safe'],
  ['privacy', 'Privacy and your data'],
  ['delete-account', 'Delete your account'],
  ['faq', 'Questions and fixes'],
];

export default function HelpPage() {
  return (
    <main className="guide">
      <div className="guide-head">
        <p className="eyebrow">USER GUIDE</p>
        <h1>Screen Time Control</h1>
        <p className="muted">Everything you need to track children&apos;s screen time against a daily limit, in plain language.</p>
        <p className="muted">Need help? Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
        <p className="no-print guide-actions">
          <Link className="button" href="/">Open the app</Link> <PrintButton />
        </p>
      </div>

      <nav className="guide-toc no-print" aria-label="Contents">
        <h2>In this guide</h2>
        <ol>{toc.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol>
      </nav>

      <section id="quick-start">
        <h2>Quick start (5 steps)</h2>
        <ol>
          <li><strong>Create your account</strong> and confirm your email, then sign in and enter the <strong>licence key</strong> from your purchase when asked.</li>
          <li>Go to <strong>Children &amp; limits</strong>, press <strong>+ Add child</strong>, and enter a name and a daily limit in minutes.</li>
          <li>On the <strong>Today&apos;s dashboard</strong>, press <strong>Log in / start</strong> on the child&apos;s card when they begin using a screen.</li>
          <li>Press <strong>Log out / stop</strong> when they finish. Do this every time, because the app cannot see the device.</li>
          <li>Watch the bar. It goes green, then amber, then red as the child gets close to the limit.</li>
        </ol>
      </section>

      <section id="what-it-does">
        <h2>What the app does, and what it does not</h2>
        <p>Screen Time Control is a <strong>tracker for caregivers</strong>. You tell it when a child starts and stops, and it adds up the day, compares it with the daily limit, and shows who is close to or over it.</p>
        <p><strong>It does not read the child&apos;s phone, tablet or TV.</strong> It cannot see what a child is doing, and it cannot lock or switch off a device. The times are the ones you record with the buttons, so the totals are only as accurate as those button presses.</p>
        <p><strong>It does not block websites or apps, and it does not monitor what a child watches, plays or types</strong>, including chat or language in online games. See <a href="#content-safe">Keeping content safe</a> for what to use alongside it.</p>
        <ul>
          <li>Works for one child or many, such as a family or a daycare room.</li>
          <li>Each caregiver has a private account and sees only their own children.</li>
          <li>Several short sessions in a day all count toward one daily allowance. Time between them does not count.</li>
        </ul>
      </section>

      <section id="install">
        <h2>Put it on your phone</h2>
        <p>There is nothing to download from an app store. Open the app&apos;s web address in your phone&apos;s browser and add it to your home screen. It then opens like an app, with its own icon.</p>
        <h3>iPhone or iPad (Safari)</h3>
        <ol><li>Open the app&apos;s address in <strong>Safari</strong>.</li><li>Tap the <strong>Share</strong> button.</li><li>Choose <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</li></ol>
        <h3>Android (Chrome)</h3>
        <ol><li>Open the app&apos;s address in <strong>Chrome</strong>.</li><li>Tap the <strong>⋮</strong> menu.</li><li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li></ol>
        <p className="muted">You need an internet connection to use it. The app does not work offline.</p>
      </section>

      <section id="account">
        <h2>Create your account and sign in</h2>
        <ol>
          <li>On the sign-in page, press <strong>Create an account</strong>.</li>
          <li>Enter your email and a password of <strong>at least 8 characters</strong>.</li>
          <li>We send you an email. <strong>Open the link in it</strong> to confirm your address. Check your spam folder if it does not arrive.</li>
          <li>Go back to the app and press <strong>Sign in</strong> with the same email and password.</li>
          <li>The first time you sign in you are asked for your <strong>licence key</strong>. Copy it from your Payhip receipt or the email Payhip sent you, paste it in and press <strong>Activate</strong>. You only do this once. <strong>Each key works for one account</strong>, so use the email address you want to keep.</li>
        </ol>
        <h3>Forgot your password?</h3>
        <ol>
          <li>On the sign-in page, press <strong>Forgot your password?</strong> and enter your email.</li>
          <li>Open the email we send and press its link. <strong>Open it in the same browser</strong> you asked from.</li>
          <li>Choose a new password (at least 8 characters) and save it.</li>
        </ol>
        <p>Use <strong>Sign out</strong> in the side menu when you are on a shared device.</p>
      </section>

      <section id="children">
        <h2>Add a child and set the daily limit</h2>
        <ol>
          <li>Open <strong>Children &amp; limits</strong> from the menu.</li>
          <li>Press <strong>+ Add child</strong>.</li>
          <li>Enter the <strong>name</strong> and the <strong>daily limit in minutes</strong> (from 1 to 1440). Age (0 to 18) and notes are optional.</li>
          <li>Press <strong>Save child</strong>.</li>
        </ol>
        <p><strong>To change a limit or details:</strong> press <strong>Edit child &amp; limit</strong> on the child&apos;s card, change what you need, write a short <strong>reason for change</strong> (at least 3 characters), and save.</p>
        <p><strong>To remove a child:</strong> press <strong>Remove child</strong> and give a reason. This also removes all of that child&apos;s sessions and cannot be undone.</p>
        <p className="muted">Tip: the limit applies to every day. If a child needs more time on a special day, raise the limit for that day and set it back afterwards.</p>
      </section>

      <section id="timer">
        <h2>Track screen time with the timer</h2>
        <h3>Start</h3>
        <ol>
          <li>On <strong>Today&apos;s dashboard</strong>, find the child&apos;s card.</li>
          <li>Choose the <strong>device</strong> (tablet, TV, phone, computer or game console) and the <strong>activity</strong> (educational, video, game, social or browsing).</li>
          <li>Press <strong>Log in / start</strong>. The card now says &ldquo;Logged in since…&rdquo;.</li>
        </ol>
        <h3>Stop</h3>
        <p>When the child is off the screen, press <strong>Log out / stop</strong> on their card. The time is added to today&apos;s total.</p>
        <h3>Stopping and starting again</h3>
        <p>Children often use a screen in several short bursts. Start and stop as often as you like. All of the bursts add up against the <strong>same daily limit</strong>, and the breaks between them are not counted.</p>
        <p><strong>One timer per child at a time.</strong> A child who is already logged in cannot be started again until you stop them.</p>
        <p className="guide-note"><strong>Remember to press stop.</strong> The app cannot tell when a child puts the device down. If nobody stops the timer it keeps running, until the daily limit or the 3-hour safety stop (see below).</p>
      </section>

      <section id="limit">
        <h2>What happens at the daily limit</h2>
        <ul>
          <li><strong>The timer stops by itself.</strong> When a running child reaches their daily limit, the session ends at that exact minute and the bar stays full.</li>
          <li><strong>A red notice</strong> &ldquo;Daily limit reached&rdquo; appears on the dashboard.</li>
          <li><strong>They cannot start again that day.</strong> Pressing <strong>Log in / start</strong> shows &ldquo;Daily limit already reached. Raise the limit or try again tomorrow.&rdquo; If you decide to allow more time, raise their limit under <strong>Children &amp; limits</strong>.</li>
          <li><strong>3-hour safety stop.</strong> A timer that is left running is closed after 3 hours and recorded as exactly 3 hours, even if the child stopped long before.</li>
          <li>The day starts again at <strong>midnight in your time zone</strong>.</li>
        </ul>
        <p className="muted">The timer is stopped by our server within about a minute of reaching the limit, even if nobody has the app open (once phone alerts are on for your account). Otherwise the stop happens the next time the dashboard opens. Either way, the recorded time never goes past the limit.</p>
      </section>

      <section id="reminders">
        <h2>Reminders</h2>
        <ul>
          <li><strong>&ldquo;Is [name] still on screen?&rdquo;</strong> appears every 30 minutes while a timer is running. Press <strong>Still on screen</strong> to keep going, or <strong>Stop now</strong> to end the session.</li>
          <li><strong>&ldquo;Almost at the daily limit&rdquo;</strong> appears when 5 minutes or less remain, so you can wrap up before the timer stops.</li>
          <li>The browser tab title also shows a ⏰ while a reminder is waiting.</li>
        </ul>
        <p className="guide-note"><strong>These on-screen reminders only show while the app is open.</strong> To get a message on your phone even when the app is closed, turn on phone alerts (next section).</p>
      </section>

      <section id="phone-alerts">
        <h2>Phone alerts (when the app is closed)</h2>
        <p>Phone alerts are messages that appear on your lock screen, like a text message. You get one:</p>
        <ul>
          <li>about <strong>5 minutes before</strong> a child reaches the daily limit,</li>
          <li>when the timer is <strong>stopped at the limit</strong> (or after the 3-hour safety stop),</li>
          <li>every <strong>30 minutes</strong> while a timer keeps running: &ldquo;Still on screen?&rdquo;</li>
        </ul>
        <h3>Turn them on</h3>
        <ol>
          <li>On the phone you want alerts on, open the app and go to <strong>Account</strong> in the menu.</li>
          <li>Under <strong>Phone alerts</strong> press <strong>Turn on alerts on this phone</strong> and choose <strong>Allow</strong> when your phone asks.</li>
          <li>Press <strong>Send a test alert</strong>. A message should arrive within a few seconds.</li>
        </ol>
        <ul>
          <li><strong>Each phone is switched on separately.</strong> If both parents want alerts, each turns them on from their own phone.</li>
          <li><strong>iPhone and iPad:</strong> first add the app to your Home Screen (Safari, Share, Add to Home Screen) and open it from that icon. Alerts do not work from a normal Safari tab. This needs iOS 16.4 or newer.</li>
          <li><strong>Android:</strong> use Chrome or Edge. Alerts also work from a normal browser tab, but installing the app is more reliable.</li>
          <li>The message shows the child&apos;s first name, so anyone who can see your lock screen can see it. You can hide notification previews in your phone&apos;s settings.</li>
          <li>To stop alerts, press <strong>Turn off on this phone</strong> on the same page.</li>
        </ul>
        <p className="guide-note"><strong>Good to know.</strong> Alerts depend on your phone&apos;s notification settings. If Do Not Disturb, a battery saver or a blocked app is on, the message may be late or missing. The daily limit is still enforced either way: the timer is stopped on our server, so the recorded time never goes past the limit.</p>
      </section>

      <section id="manual">
        <h2>Log a session after the fact</h2>
        <p>If you forgot to use the timer, add the time by hand.</p>
        <ol>
          <li>Open <strong>Log session</strong> from the menu.</li>
          <li>Pick the <strong>child</strong>, <strong>device</strong> and <strong>activity</strong>.</li>
          <li>Set the <strong>start time</strong> and the <strong>duration in minutes</strong> (1 to 1440). Add a note if you like.</li>
          <li>Press <strong>Save session</strong>.</li>
        </ol>
        <p className="muted">Sessions added by hand count toward the day like any other and are not blocked by the limit, so they can take a child over it.</p>
      </section>

      <section id="history">
        <h2>Session history: edit and delete</h2>
        <p>Open <strong>Children &amp; limits</strong> and scroll to <strong>Session history</strong>. Filter by <strong>child</strong> and by <strong>day</strong>, or press <strong>View history</strong> on a child&apos;s card.</p>
        <ul>
          <li><strong>Edit session</strong> changes the child, device, activity, start time, duration or note. You must write a short reason.</li>
          <li><strong>Delete session</strong> removes it and changes that day&apos;s total. You must give a reason, and it cannot be undone.</li>
          <li>A session that is <strong>still running</strong> cannot be edited. Press <strong>Log out on dashboard</strong>, stop it there, then edit it.</li>
          <li>A record of every change is kept, including your reason.</li>
        </ul>
        <p><strong>If the timer ran too long</strong> because it was not stopped, edit that session and correct its duration.</p>
      </section>

      <section id="dashboard">
        <h2>Reading the dashboard</h2>
        <p>The top shows how many children you have, the screen time used today, and how many have reached their limit. Each child has a card with a bar and their minutes used out of their limit.</p>
        <table className="guide-table">
          <thead><tr><th>Colour</th><th>Label</th><th>Meaning</th></tr></thead>
          <tbody>
            <tr><td>Green</td><td>Looking balanced</td><td>Less than 75% of today&apos;s limit used.</td></tr>
            <tr><td>Amber</td><td>Approaching limit</td><td>75% to 99% of the limit used.</td></tr>
            <tr><td>Red</td><td>Limit reached / Over limit</td><td>The limit has been reached, or passed (for example by a session added by hand).</td></tr>
          </tbody>
        </table>
        <p>Children closest to or over their limit are listed first. Each card also shows the minutes remaining, or how far over the child is.</p>
      </section>

      <section id="content-safe">
        <h2>Keeping content safe</h2>
        <p>This app tracks <strong>how long</strong> a child is on a screen. It does <strong>not</strong> check <strong>what</strong> they see or say. It has no website blocking, no filtering by age rating, and no monitoring of chat or language in online games.</p>
        <p>For that, use the free parental controls that already exist on the devices, games and home network your child uses. Use them <strong>alongside</strong> this app.</p>
        <table className="guide-table">
          <thead><tr><th>You want to…</th><th>Use</th></tr></thead>
          <tbody>
            <tr><td>Track time and keep to a daily limit</td><td>This app</td></tr>
            <tr><td>Block or approve apps and websites, set age ratings, restrict purchases</td><td>The device&apos;s own parental controls</td></tr>
            <tr><td>Control who can chat with your child in a game</td><td>The game or platform&apos;s own settings</td></tr>
            <tr><td>Filter adult content for every device at home</td><td>Your home router or a family-friendly DNS service</td></tr>
          </tbody>
        </table>
        <h3>On the device</h3>
        <ul>
          <li><strong>Apple iPhone and iPad:</strong> Screen Time, then Content &amp; Privacy Restrictions, to limit apps, web content, age ratings and purchases.</li>
          <li><strong>Android:</strong> Google Family Link, to approve apps and set content filters.</li>
          <li><strong>Windows:</strong> Microsoft Family Safety.</li>
        </ul>
        <h3>In games and video apps</h3>
        <ul>
          <li>Open the parental-control or privacy settings for each platform your child uses, such as Xbox, PlayStation, Nintendo Switch, Roblox, Minecraft and YouTube Kids.</li>
          <li><strong>Check who can message your child.</strong> Where the game allows it, turn chat off or limit it to people you have approved, and require your approval for friend requests.</li>
        </ul>
        <h3>On your home network</h3>
        <ul>
          <li>Many routers have parental controls. You can also use a family-friendly DNS service, for example CleanBrowsing or OpenDNS FamilyShield, to filter adult websites on every device on your Wi-Fi.</li>
          <li>Filters help but are not perfect, and they do not cover mobile data away from home.</li>
        </ul>
        <h3>Talk with your child</h3>
        <ul>
          <li>Agree simple rules together, and keep screens in shared spaces where you can.</li>
          <li>Tell your child they can always come to you if something online upsets or confuses them, and that they will not be in trouble.</li>
          <li>Use the <strong>activity</strong> and <strong>note</strong> fields in this app to keep a record of what they were doing.</li>
        </ul>
        <p className="muted">Menus and names change from time to time, so check each company&apos;s own help pages for the current steps. Screen Time Control is not affiliated with any of the products named here.</p>
      </section>

      <section id="privacy">
        <h2>Privacy and your data</h2>
        <ul>
          <li>Your children and their sessions are <strong>private to your account</strong>. Other users cannot see them.</li>
          <li>Anyone who knows your email and password can see your data, so keep your password to yourself and use <strong>Sign out</strong> on shared devices.</li>
          <li>Removing a child removes their sessions. A record of the change is kept until you delete your account.</li>
          <li>Use a first name or nickname if you prefer. The app does not need a child&apos;s full name or any other detail.</li>
        </ul>
      </section>

      <section id="delete-account">
        <h2>Delete your account</h2>
        <p>You can delete your account yourself at any time. Open <strong>Account</strong> in the menu, enter your password, type <strong>DELETE</strong>, and press <strong>Delete my account and all data</strong>.</p>
        <p>This <strong>immediately and permanently</strong> deletes your sign-in, every child you added, all their sessions, the history of changes and your licence record. It cannot be undone, so save anything you want to keep first. It does <strong>not</strong> refund your purchase.</p>
      </section>

      <section id="faq">
        <h2>Questions and fixes</h2>
        <h3>I forgot to stop the timer.</h3>
        <p>Stop it as soon as you notice. Then open <strong>Children &amp; limits → Session history</strong>, press <strong>Edit session</strong> on that session, and set the real duration with a reason.</p>
        <h3>The child cannot start. It says the daily limit is already reached.</h3>
        <p>They have used all of today&apos;s time. Raise their limit under <strong>Children &amp; limits</strong> if you want to allow more, or wait for tomorrow.</p>
        <h3>I did not get the confirmation or reset email.</h3>
        <p>Check your spam folder and wait a few minutes. Make sure the address is spelled correctly. Then try again. If the link says it has expired, request a new one and open it in the same browser.</p>
        <h3>My licence key is not accepted.</h3>
        <p>Copy it again from your Payhip receipt or email and paste it exactly, without extra spaces. Letters can be upper or lower case. If it still fails, the key may have been refunded or disabled. Email us the address you used to buy.</p>
        <h3>It says my licence key has already been used.</h3>
        <p>Each key activates one account. If you already activated it, sign in with that same account. If you did not, email us with your Payhip order details and we will help.</p>
        <h3>My purchase was refunded and the app stopped working.</h3>
        <p>That is expected. When a purchase is refunded, we pause the account. Your data is kept, and you can still sign in to open <strong>Account</strong> and delete it. If you have bought again, enter your new licence key on the page that appears.</p>
        <h3>The totals look wrong, or the day changes at the wrong time.</h3>
        <p>The day follows the time zone of your phone or computer. Check that its date, time and time zone are correct, then reload the app.</p>
        <h3>The numbers did not update.</h3>
        <p>The dashboard refreshes by itself about every 30 seconds. Pull down to reload, or close and reopen the app.</p>
        <h3>I can&apos;t edit a session.</h3>
        <p>Running sessions can only be stopped, not edited. Stop it first, then edit it from the history.</p>
        <h3>Can the app block the child&apos;s device, or filter what they see?</h3>
        <p>No. It records and reminds. You decide when the screen goes off. It also does not filter websites or monitor chat, so see <a href="#content-safe">Keeping content safe</a> for tools that do.</p>
        <h3>Does it work without internet?</h3>
        <p>No. You need a connection to start, stop and see totals.</p>
        <p className="muted">Still stuck? Email us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and tell us what you were doing and what you saw on the screen.</p>
      </section>

      <div className="guide-foot no-print">
        <Link className="button" href="/">Open the app</Link>
      </div>
    </main>
  );
}
