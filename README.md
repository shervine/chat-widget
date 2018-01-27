# Overview

Mench is a learning game on Facebook Messenger. We connect online instructors to students for on-demand learning over a Chatbot.

## URL
http://chat.mench.co:3000/

## Student Chat Widget Project

This is a JS-based responsive web application for Mench instructors to chat with their Bootcamp students, live.

## Relevant Technologies

- Javascript
- NodeJS
- AngularJS or React
- HTML & CSS
- PostgreSQL Quering
- JSON API End Points

## Mockups

View & comment on the UI mockups here:

https://docs.google.com/presentation/d/18OmMpJPpFe9GUOtRHT_yMa8BY8pzQoF8JHdM4jEHaow

## Issues & Milestones

Checkout this project's Issue & Milestones tab for more information on key milestones and related issues.


## Tables Relationships

### v5_engagements "e"

- v5_engagements.e_type_id = v5_engagement_types.a_id
- v5_engagements.e_object_id DEPENDS on v5_engagement_types.a_object_code to define that Object means for this engagement. IF v5_engagement_types.a_object_code = NULL THEN v5_engagements.e_object_id = NULL
- v5_engagements.e_creator_id = v5_users.u_id
- v5_engagements.e_b_id = v5_bootcamps.b_id
