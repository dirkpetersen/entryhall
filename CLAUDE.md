# CLAUDE.md for a Supercomputer Resource Management System

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. The application is a very easy to use single page app with multiple tabs. It will be entirely vibe coded using Claude code.

## Overview

`Entryhall` is a user profile, resource management and gateway application for a large AI supercomputer at our university. This resource will be available to all university faculty and staff, as well as other universities in the state. Users from approximately a dozen universities will be able to sign up using their university email addresses.

## Development stack

## Application Structure

### Tab 1: User Account Management

**User Registration & Authentication:**

- Users sign up with their university email address
- Email verification required, email needs to e verified at regular intervals configured by administrator
- some university email domains will be integrated via federation (for example oregonstate.edu). Needs to be configurable by admin 
- 
- Basic information collection:
  - Full name
  - Title/Position
  - Role: staff / professional faculty or Faculty
  - University and Department

**Linked Identity Management:**
Users can link additional identities:

1. **Google Account** - Not necessarily ending with university email domain, store email identity and underlying long int google id
2. **GitHub Account** - For code repository integration, store the github user id as well as the unterlying long int github numeric id
3. **ORCID Account** - For researcher identification
4. **LinkedIN account** - For addional infornmation (required for users that do not have an .edu email address )

Default billing information: for home university (e.g. oregonstate.edu) these need to be 2 fields: Default Index (billing account) and "Default Activity Code" or users will not be able to create woerk IDs 

### Tab 2: Resource Management

#### Projects / Woerks 

**Project Management System:**

- Users can create new projects (called "woerks")
- Projects displayed in a list view

**Project Attributes:**

- **Woerk ID**: randomly assinged 5-character alphanumeric identifier with hyphen as middle character (e.g., AB-12). The alphanumeric identifier must be glo
- **Short Name**: Maximum 30 characters
- **Description**: Maximum 1024 characters

**Project Classification:**

- **Non-grant Projects**: No additional metadata required
- **U.S. Federal Projects**:
  - Search interface connected to grants.gov API
  - Multi-word search capability across all fields
  - API endpoints:
    - `https://www.grants.gov/api/common/search2`
    - `https://www.grants.gov/api/common/fetchopportunity`
  - Retrieved data stored locally:
    - Project ID
    - Funding agency
    - API information
    - Project description
  
#### Allocations 

### Tab 3: Authorization Management

**Group Management:**

- Integration with LDAPS and Grouper API
  - See Grouper Rest API  
  - https://software.internet2.edu/grouper/doc/master/grouper-ws-parent/grouper-ws/apidocs/edu/internet2/middleware/grouper/ws/rest/package-summary.html
  - https://github.com/Internet2/grouper/tree/GROUPER_5_BRANCH/grouper-ws/grouper-ws/src/grouper-ws/edu/internet2/middleware/grouper/ws/rest
- Groups assigned to specific projects
- Features:
  - Project selection dropdown
  - List of all groups assigned to selected project
  - Create new groups
  - Manage group membership

### Tab 4: File Management

**Web-based File Transfer Interface:**

- Upload and download capabilities
- Target folder selection via dropdown menu
- Support for both:
  - POSIX-based storage
  - S3-based storage

### Tab 5: Terminal Access

**SSH Terminal Component:**

- Based on xterm.js (https://xtermjs.org/)
- Direct login to bastion SSH host
- Authentication via secure SSH certificates

## Technical Requirements

- Multi-university support (approximately 12 institutions)
- Secure authentication and authorization
- Integration with external APIs (grants.gov, LDAPS/Grouper)
- Web-based terminal emulation
- Support for multiple storage backends

### Tab 6: Github Access

- by default empty tab unless users have linked their github account in Tab 1, point users to tab 1
- searchable pull down field that allows you to either pick or enter a github https://url


