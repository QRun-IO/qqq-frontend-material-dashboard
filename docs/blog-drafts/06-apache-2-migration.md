# We're Dropping AGPL. Here's Why.

Starting with version 0.36, qqq and its related modules are Apache 2.0.

This isn't a small change. AGPL was our license from day one. It felt right - copyleft, network-use provisions, protect the commons. But after talking to dozens of developers and potential users, we kept hitting the same wall.

"We can't use it. Legal won't approve AGPL for our SaaS."

## The Problem

AGPL Section 13 requires anyone running AGPL software as a service to open-source their entire application. That's the point of the license - if you use it, you contribute back.

But our target customers are SaaS builders. Startups. Teams building proprietary products on tight timelines. They don't want to open-source their business logic. They can't. And we don't think they should have to.

We said "free for startups under $10M ARR" but that wasn't legally accurate. Under AGPL, they'd have to release their code regardless of revenue. The license contradicted our messaging.

## Why Apache 2.0

Apache 2.0 is what Kubernetes uses. And React. And Supabase. There's a reason.

- **No copyleft.** Build proprietary software. Keep your code.
- **Explicit patent grant.** Protection that MIT doesn't provide.
- **Enterprise-friendly.** Legal teams approve it without a fight.
- **SaaS-compatible.** Deploy as a service, no obligations.

The trade-off is real. Cloud providers could fork qqq tomorrow. Competitors can build on our work without contributing back. We're betting we can out-execute rather than out-license.

## What Changes

**Apache 2.0 (open, free, no obligations):**
- `qqq` - core framework
- `qqq-frontend-core` - frontend foundation
- `qqq-frontend-material-dashboard` - Material UI dashboard
- `qqq-android` - mobile
- `qctl` - CLI tools
- Community qBits (process-trace, webhooks, geo-data, etc.)
- Templates and tooling

**Proprietary (premium features):**
- qStudio
- qRun platform
- Premium qBits (OMS, WMS, CRM when they ship)
- Enterprise support

The core stays open. The stuff that costs us money to build and support stays commercial. Open-core model, same as GitLab or HashiCorp.

## What This Means For You

If you're building on qqq today: nothing changes in your workflow. The API is the same. The framework works the same. You just have more freedom with what you build.

If you were waiting because of AGPL: the door is open. Build your SaaS. Keep your code private. We won't ask for anything except that you build something great.

If you were contributing under AGPL: thank you. Your contributions are now under Apache 2.0. Same code, more permissive license.

## The Version Boundary

Everything before 0.36 stays AGPL-3.0. We can't retroactively change that.

0.36 and forward is Apache 2.0. Clean break.

If you need AGPL for some reason (it does exist), pin to 0.35.x. But we think most people will prefer the freedom.

## What's Next

The LICENSE file in each repository is the authoritative source. Those are updated now with Apache 2.0. NOTICE files with proper attribution are in place. README badges reflect the change.

You'll still see old AGPL headers in some source files. That's cosmetic - the LICENSE file governs. We'll update file headers gradually as we touch code, but don't let stale headers confuse you. Check the LICENSE file in the repo root. That's what counts.

The framework itself keeps improving. This is a legal change, not a technical one. Same roadmap. Same velocity. Just fewer barriers to adoption.

Build your SaaS on qqq. Your code stays yours.
