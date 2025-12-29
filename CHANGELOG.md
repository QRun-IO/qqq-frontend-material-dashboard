# Changelog

All notable changes to QQQ Frontend Material Dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.35.0] - 2025-12-29

### Changed
- Upgraded to Java 21
- Updated qqq-orb to 0.5.0 for Java 21 CI support
- Updated qqq.version dependency to 0.35.0
- Updated license to AGPL-3.0 with QRun-IO copyright

### Added
- Row builder widget with drag & drop reordering support
- Field-as-widget adornment support for custom field UI rendering
- Path-agnostic SPA support for multiple hosting paths
- OAuth2 authentication flow with dynamic base path support
- Pluggable themes design documentation

### Fixed
- Boolean equals-false filter being lost when saved as a view
- Null pointer when setting up grid column models without table path
- Query operator labels showing inaccurate 'or equals' text
- Record sidebar min-height to prevent shrinking on short screens

## [0.25.0] - 2025-05-20

### Added
- OAuth2 authentication module
- Banner support for system-wide notifications
- Query-param default process values as JSON object
- Min/max input record validation alerts for processes

### Changed
- Refactored authentication handling to pass metadata into App
- Improved goto dialog behavior for empty string fields

### Fixed
- Goto fields quick bug fix
- Full-width file upload adornment for lg-size fields

## [0.24.0] - 2025-03-06

### Added
- SFTP and headless bulk load support
- Dynamic URL support for blob downloads
- Field column width support on view and edit forms
- Default values for new child records from parent fields
- Filter JSON field improvements with preview

### Changed
- Removed textTransform="capitalize" from page headers
- Added LONG to types that get numeric operators

### Fixed
- Blob download URLs when not using dynamic URL
- Child record dashboard widget force reload on removal

## [0.23.0] - 2024-11-22

### Added
- Mobile-first UI/UX improvements
- Ad-hoc composite/block widgets
- Non-linear process flow support
- Child record widget data display
- Generate labels POC

### Changed
- Updated block widget rendering for Android app compatibility
- Added proxy for /qqq/* versioned middleware
- Improved next/submit handling for validation screens

### Fixed
- Filter-as-widget dropping possible-value fields with defaultFilter
- Non-blob file downloads in value utils

## [0.22.0] - 2024-09-04

### Added
- Query filter widget preview functionality
- Timezone conversion for date formatting

### Changed
- Default operator for DATE fields changed to equals
- Added tabular-nums font variant for counting numbers

### Fixed
- Possible value filter bug with use-case handling
- Date query bugs with timezone conversion

## [0.21.0] - 2024-08-23

- Initial tracked release
