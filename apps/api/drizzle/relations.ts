import { relations } from "drizzle-orm/relations";
import { customer, project, eventIdentity, event, session, transition } from "./schema";

export const projectRelations = relations(project, ({one, many}) => ({
	customer: one(customer, {
		fields: [project.customerId],
		references: [customer.id]
	}),
	sessions: many(session),
	transitions: many(transition),
}));

export const customerRelations = relations(customer, ({many}) => ({
	projects: many(project),
}));

export const eventRelations = relations(event, ({one}) => ({
	eventIdentity: one(eventIdentity, {
		fields: [event.eventIdentityId],
		references: [eventIdentity.id]
	}),
	session: one(session, {
		fields: [event.sessionId],
		references: [session.id]
	}),
}));

export const eventIdentityRelations = relations(eventIdentity, ({many}) => ({
	events: many(event),
	transitions_fromEventIdentityId: many(transition, {
		relationName: "transition_fromEventIdentityId_eventIdentity_id"
	}),
	transitions_toEventIdentityId: many(transition, {
		relationName: "transition_toEventIdentityId_eventIdentity_id"
	}),
}));

export const sessionRelations = relations(session, ({one, many}) => ({
	events: many(event),
	project: one(project, {
		fields: [session.projectId],
		references: [project.id]
	}),
}));

export const transitionRelations = relations(transition, ({one}) => ({
	eventIdentity_fromEventIdentityId: one(eventIdentity, {
		fields: [transition.fromEventIdentityId],
		references: [eventIdentity.id],
		relationName: "transition_fromEventIdentityId_eventIdentity_id"
	}),
	eventIdentity_toEventIdentityId: one(eventIdentity, {
		fields: [transition.toEventIdentityId],
		references: [eventIdentity.id],
		relationName: "transition_toEventIdentityId_eventIdentity_id"
	}),
	project: one(project, {
		fields: [transition.projectId],
		references: [project.id]
	}),
}));