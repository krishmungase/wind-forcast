const ELEXON_URL = 'https://bmrs.elexon.co.uk/api-documentation';

/** How the numbers are produced, for anyone checking the method. */
const MethodNote = () => (
  <footer className="border-t pt-6 pb-10 text-sm text-muted-foreground">
    <h2 className="mb-3 font-medium text-foreground">
      How these numbers are made
    </h2>
    <ul className="grid max-w-5xl gap-x-10 gap-y-2 md:grid-cols-2">
      <li>
        Actual output is Elexon's half-hourly metered wind generation (FUELHH).
        Forecasts are Elexon's national wind forecasts (WINDFOR), published
        about eight times a day for each hour up to two days ahead.
      </li>
      <li>
        For each delivery hour, the forecast used is the latest one published at
        least the chosen number of hours earlier. Hours with no such forecast
        are left out.
      </li>
      <li>
        Error is forecast minus actual, compared on the hour because forecasts
        are hourly. All times are UK time, which is GMT in January.
      </li>
      <li>
        A likely cause of the lean is curtailment: wind farms paid to switch off
        lower metered output, while the forecast shows what the wind could have
        produced. Elexon's wind data alone can't confirm this.
      </li>
    </ul>
    <p className="mt-4">
      Data:{' '}
      <a
        href={ELEXON_URL}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2 hover:text-foreground"
      >
        Elexon BMRS
      </a>
      , January 2026.
    </p>
  </footer>
);

export default MethodNote;
