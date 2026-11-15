# LOADMASTER with live Current RMS jobs

`index.html` is the load planner. `api/rms.js` is a small server-side connection
that holds your Current RMS API key, so the key never goes into the page.

## Deploy (about 5 minutes)

1. Open Terminal in this folder.
2. Run `npx vercel` and answer the questions (new project, name it `loadmaster`,
   defaults for the rest).
3. In the Vercel dashboard open the project, then Settings > Environment Variables,
   and add:
   - `RMS_API_KEY`: your Current RMS API key
   - `LOADMASTER_PASSCODE`: any passcode you choose (the page asks for it)
   - `RMS_SUBDOMAIN`: `kudosgroup` (optional, this is the default)
4. Run `npx vercel --prod` to publish with those settings.
5. Open the production address, go to the **RMS** tab, enter the passcode, search for a job.

## What the connection allows

Read-only requests for jobs and their items, and nothing else. Every request needs
the passcode. If you ever want to cut access, change `LOADMASTER_PASSCODE` in
Vercel and redeploy.

## Using it

1. **RMS** tab: search a job name, or type a job ID.
2. Press **Load kit list**. Items that match a case in your library are ticked.
3. Items that don't match are listed underneath. Pick the right case from the
   dropdown once and it is remembered for every future job.
4. **Add selected to load list**, then plan the truck as normal.
5. Cable trunks, or anything not prepped yet, can be added from the **Cases** tab.

## Your library and fleet

On this site they are saved in the browser you use. To bring over what you built in
the published page, press **Export library** there and **Import library** here.

## Not yet checked against live data

The connection was tested against a mock of Current RMS, not your account. If a
job shows no items, or the search finds nothing, send me what the RMS tab says
and I'll adjust it.
