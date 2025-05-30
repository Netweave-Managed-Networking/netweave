# Database Schema - Documentation of Entities and Relations

<ul>
<li><small>entities are displayed as "###" headlines, small-tags are used to describe the entity and each pre-tag is one attribute of the entity</small></li>
<li><small>all entities have a unique unsigned integer as primary key</small></li>
<li><small>all entities have created_at and updated_at timestamps</small></li>
<li><small>the symbol "🗝️" means it is a foreign key. The type (e.g. "User") is the Entity whose primary key is referenced</small></li>
<li><small>each attribute has a type. (e.g. `name: text`. 'name' is the attribute name, 'text' is the type).</small></li>
<li><small>the type can be followed by additional column information like unique, default or index. E.g.: name: text, unique, default: "Marvin", index: fulltext</small></li>
<li><small>a question mark before the colon "?:" means the attribute is nullable</small></li>
<li><small>the type "short" stands for a short text/string</small></li>
<li><small>the type "text" stands for a medium text/string</small></li>
<li><small>the type "long" stands for a long text/string</small></li>
<li><small>the database type "enum" is prohibited. union types (like "admin" | "editor") will be stored as strings in the database. Instead enums and const values will be used on application level.</small></li>
</ul>

## Users and Registration

### User

<small>The default Laravel User.</small>

<pre>...all laravel attributes (name, email, remember_token...)</pre>
<pre>role: "admin" | "editor", default: "editor"</pre>

### InvitationCode

<small>A InvitationCode is needed in order to register new users. Admins create codes (admin_id). The new user uses the code during registration (editor_id).</small>

<pre>code: short, unique</pre>
<pre>🗝️editor_id?: User, onDelete: set null</pre>
<pre>🗝️admin_id: User, onDelete: cascade</pre>

## Organizations and Resources

### Organization

<small>The most important entity. The Organization that works on a local level and needs networking possibilities.</small>
<small>When the term ‘Stakeholder’ is used, this is synonymous with ‘Organization’.</small>
<small>Each Organization has a specific relationship type to every other Organization. See organization_to_organization pivot table.</small>
<small>Each Organization belongs to one or sometimes more than one category.</small>
<small>This entity soft deletes.</small>

<pre>name: short, unique</pre>
<pre>email?: email, unique</pre>
<pre>phone?: short, unique</pre>
<pre>postcode_city?: short</pre>
<pre>street_hnr?: short</pre>

### Notes

<small>Each organization can have additional notes which would be often queried if they exist.</small>
<small>Each organization can at most one Note. Organization 1:1 Notes.</small>

<pre>notes?: text, index: fulltext</pre>
<pre>🗝️organization_id: Organization, onDelete: cascade</pre>

### CoopCriteria

<small>Each organization can have additional criteria for cooperation which would be often queried if they exist.</small>
<small>For coop: What is necessary for this organization so that a cooperation with another organization can happen.</small>
<small>K.O. no coop: What would be something that makes a organization be not able / not willing to cooperate with another organization.</small>
<small>Each organization can at most one CoopCriteria. Organization 1:1 CoopCriteria.</small>

<pre>for_coop?: text, index: fulltext</pre>
<pre>ko_no_coop?: text, index: fulltext</pre>
<pre>🗝️organization_id: Organization, onDelete: cascade</pre>

### organization_to_organization (pivot table)

<small>Each Organization has a specific relationship type to every other Organization.</small>
<small>This relation is unidirectional and not agreed on. One Organization states the relation it has to another one. No matter what the stated Organization thinks about the relation to the organization stating.</small>
<small>When a organization says it doesnt know a organization, conflict is not allowed to be true.</small>
<small>When a organization says it knows/exchanges with/cooperates with a organization, conflict is allowed to be true or false.</small>

<pre>type: "doesnt" | "knows" | "exchanges" | "cooperates"</pre>
<pre>conflict: boolean, default: "false"</pre>
<pre>🗝️organization_stating_id: Organization, onDelete: cascade</pre>
<pre>🗝️organization_stated_id: Organization, onDelete: cascade</pre>

### OrganizationCategory

<small>A category of a organization.</small>
<small>Each organization belongs to one or sometimes more than one category.</small>

<pre>name: short, unique</pre>
<pre>description?: text</pre>

### organization_to_category (pivot table)

<small>Organization n:m OrganizationCategory.</small>

<pre>🗝️organization_category_id: OrganizationCategory, onDelete: cascade</pre>
<pre>organization_id: Organization, onDelete: cascade</pre>

### ContactPerson

<small>A contact person of a organization. Organizations in most cases have one sometimes more contact persons.</small>
<small>Both email and phone are optional. But one of the two must be given.</small>
<small>As each ContactPerson belongs to exactly one Organization, in the exceptional case that one person is the contact person of several Organizations, this person must be created several times, once for each organization.</small>

<pre>name: short</pre>
<pre>email?: email</pre>
<pre>phone?: short</pre>
<pre>street_hnr?: short</pre>
<pre>postcode_city?: short</pre>
<pre>🗝️organization_id: Organization, onDelete: cascade</pre>

### Restriction

<small>A restriction of a organization.</small>
<small>Organizations may have restrictions in their area of work. These can be…</small>
<small><br>&emsp;- `regional`, e.g. the focus on a district or a municipality.</small>
<small><br>&emsp;- `thematic`, e.g. a focus on research projects in the field of zoology, e.g. commissioned work in landscape planning.</small>

<pre>type: "regional" | "thematic"</pre>
<pre>description: text, index: fulltext</pre>
<pre>🗝️organization_id: Organization, onDelete: cascade</pre>

### Consent

<small>A organization gets asked about their consent to different things like being part of network survey or being asked for additional research or collecting personal data or something.</small>
<small>A organization can give or deny their consent to multiple things.</small>
<small>A thing (paragraph of consent) can be allowed/denied by multiple organizations.</small>
<small>Organization n:m Consent, see organization_to_consent pivot table.</small>
<small>This entity soft deletes.</small>

<pre>paragraph: text, unique</pre>
<pre>review_date?: time</pre>
<pre>valid_until?: time</pre>

### organization_to_consent (pivot table)

<small>Organization n:m Consent.</small>

<pre>agreed: boolean, default: "false"</pre>
<pre>🗝️consent_id: Consent, onDelete: cascade</pre>
<pre>🗝️organization_id: Organization, onDelete: cascade</pre>

### Resource

<small>The second most important entity. Organizations have interest in very specific resources.</small>
<small>Each resource belongs to at least one resource category.</small>
<small>A organization either has or needs a resource.</small>
<small>Resources can be used for matching organizations by their needs.</small>
<small>Descriptions of resources often have to be read out and compared with the descriptions of resources of other organizations.</small>
<small>For better human readability/faster understanding of a resource, resources can have a summary with a short explanation of the resource.</small>
<small>This entity soft deletes.</small>

<pre>summary?: text, index: fulltext</pre>
<pre>description: text, index: fulltext</pre>
<pre>type: "resource" | "requirement", index: B-tree</pre>
<pre>🗝️organization_id: Organization, onDelete: cascade</pre>

### ResourceCategory

<small>A category of a resource.</small>
<small>Resources can belong to multiple categories (not more than 3 would be good). Categories have multiple Resources. So ResourceCategory n:m Resource.</small>
<small>A category can be something not-materialistic like 'Education' or 'Biological Knowledge' or something materialistic like 'Areas' or 'Tools'</small>

<pre>title: short, unique</pre>
<pre>definition?: text, unique</pre>

### resource_to_category (pivot table)

<small>Resource n:m ResourceCategory.</small>

<pre>🗝️resource_category_id: ResourceCategory, onDelete: cascade</pre>
<pre>🗝️resource_id: Resource, onDelete: cascade</pre>

## Survey

### SurveyQuestion

<small>A question is of a specific type.</small>
<small>Each question belongs to exactly one topic.</small>
<small>Each question has a specific position where it is displayed. This is handled by the topic it belongs to.</small>
<small>This entity soft deletes.</small>

<pre>text: short</pre>
<pre>type: "text" | "choice" | "range" | "likert" | "budget" | "org_culture", default: "text"</pre>
<pre>is_required: boolean, default: "false"</pre>
<pre>is_active: boolean, default: "true"</pre>
<pre>tooltip?: text</pre>
<pre>🗝️survey_topic_id: SurveyTopic, onDelete: no action</pre>

### SurveyTextQuestion _is_a_ SurveyQuestion

<small>A question of the specific type "text".</small>

<pre>🗝️survey_question_id: SurveyQuestion, onDelete: cascade</pre>
<pre>is_multiline: boolean</pre>
<pre>placeholder: text</pre>

### SurveyChoiceQuestion _is_a_ SurveyQuestion

<small>A question of the specific type "choice".</small>

<pre>🗝️survey_question_id: SurveyQuestion, onDelete: cascade</pre>
<pre>is_single_choice: boolean</pre>
<pre>choices: json</pre>

### SurveyRangeQuestion _is_a_ SurveyQuestion

<small>A question of the specific type "range".</small>

<pre>🗝️survey_question_id: SurveyQuestion, onDelete: cascade</pre>
<pre>from: int</pre>
<pre>to: int</pre>
<pre>step: u_int</pre>

### SurveyLikertQuestion _is_a_ SurveyQuestion

<small>A question of the specific type "likert".</small>

<pre>🗝️survey_question_id: SurveyQuestion, onDelete: cascade</pre>
<pre>is_inverted: boolean</pre>
<pre>is_nep: boolean</pre>

### SurveyBudgetQuestion _is_a_ SurveyQuestion

<small>A question of the specific type "budget".</small>

<pre>🗝️survey_question_id: SurveyQuestion, onDelete: cascade</pre>
<pre>choices: json</pre>
<pre>budget_points: u_int</pre>

### SurveyOrgCultureQuestion _is_a_ SurveyQuestion

<small>A question of the specific type "org_culture".</small>

<pre>🗝️survey_question_id: SurveyQuestion, onDelete: cascade</pre>
<pre>clan: text</pre>
<pre>adhocracy: text</pre>
<pre>market_orientated: text</pre>
<pre>hierarchy: text</pre>
<pre>budget_points: u_int</pre>
<pre>dimension?: string</pre>

### SurveyTopic

<small>A topic of multiple questions. Used to group questions.</small>
<small>Each question belongs to exactly one topic.</small>
<small>Each topic usually belongs to one survey. But can be reused unchanged in newer surveys or used in another survey at the same time.</small>
<small>SurveyTopic n:m Survey</small>
<small>Each topic has a specific position where it is displayed. This is handled by the survey it belongs to.</small>

<pre>title: short, unique</pre>
<pre>description: text, unique</pre>
<pre>is_active: boolean, default: "true"</pre>
<pre>question_positions: json, default: "[]"</pre>
<pre>tooltip?: text</pre>

### Survey

<small>A Survey which is active and can be replaced by newer surveys. This helps with versioning different survey without every updating questions.</small>
<small>A group of multiple topics thus questions.</small>
<small>Each topic usually belongs to one survey. But can be reused unchanged in newer surveys or used in another survey at the same time.</small>
<small>SurveyTopic n:m Survey</small>
<small>Each topic has a specific position where it is displayed. This is handled by the survey it belongs to.</small>

<pre>name: short</pre>
<pre>description?: text</pre>
<pre>is_active: boolean, default: "true"</pre>
<pre>topic_positions: json, default: "[]"</pre>

### topic_to_survey (pivot table)

<small>Survey n:m SurveyTopic</small>

<pre>🗝️survey_id: Survey</pre>
<pre>🗝️survey_topic_id: SurveyTopic</pre>

### SurveyAnswer (pivot table, alternative name: question_organization)

<small>Every question is answered by multiple Organizations. Every Organization answers multiple questions.</small>
<small>Question n:m Organization.</small>
<small>Question 1:n SurveyAnswer (by multiple Organizations).</small>
<small>Organization 1:n SurveyAnswer (because multiple Questions answered).</small>
<small>The answer of the organization will be parsed to a string incase a question of type "choice", "range" or "budget" is answered.</small>

<pre>answer: text</pre>
<pre>🗝️survey_question_id: SurveyQuestion, onDelete: no action</pre>
<pre>🗝️organization_id: Organization, onDelete: cascade</pre>
