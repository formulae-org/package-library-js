/*
Fōrmulæ library package. Module for edition.
Copyright (C) 2015-2026 Laurence R. Ugalde

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

"use strict";

export class Library extends Formulae.Package {}

const editionEntity = function(tag) {
	let n = Formulae.createExpression(tag);
	n.create();

	Formulae.sExpression.replaceBy(n);
	Formulae.sHandler.prepareDisplay();
	Formulae.sHandler.display();
	Formulae.setSelected(Formulae.sHandler, n, false);
}

Library.entityExpandCollapseAction = {
	isAvailableNow: () => true,
	getDescription: () => Library.messages.actionExpandCollapseEntity,
	doAction: () => {
		Formulae.sExpression.expanded = !Formulae.sExpression.expanded;

		Formulae.sHandler.prepareDisplay();
		Formulae.sHandler.display();
		Formulae.setSelected(Formulae.sHandler, Formulae.sExpression, false);
	}
};

Library.editionGetAttribute = function() {
	let s = prompt(Library.messages.enterAttributeName);

	if (s == null) return;

	let newExpression = Formulae.createExpression("Library.GetAttribute");
	newExpression.set("Name", s);

	let ch = Formulae.sExpression;

	Formulae.sExpression.replaceBy(newExpression);
	newExpression.addChild(ch);

	Formulae.sHandler.prepareDisplay();
	Formulae.sHandler.display();
	Formulae.setSelected(Formulae.sHandler, newExpression, false);
}

Library.actionGetAttribute = {
	isAvailableNow: () => true,
	getDescription: () => Library.messages.actionEditAttribute,
	doAction: () => {
		let s = Formulae.sExpression.get("Name");
		s = prompt(Library.messages.enterAttributeName, s);

		if (s == null) return;

		Formulae.sExpression.set("Name", s);

		Formulae.sHandler.prepareDisplay();
		Formulae.sHandler.display();
		Formulae.setSelected(Formulae.sHandler, Formulae.sExpression, false);
	}
};

Library.setEditions = function() {
	// Full-fidelity entity icon: mirrors ConcreteEntity.create()'s own output exactly, by
	// reading the specification off a freshly constructed (but uncreated) instance rather
	// than duplicating it — stays in sync automatically if a specification ever changes.
	// Nested entity-valued attributes are shown collapsed, exactly as create() leaves them;
	// simple attributes show an empty Null slot, honestly reflecting that they start empty.
	const entityIcon = tag => {
		let spec = Formulae.createExpression(tag).specification;
		let children = spec.attributes.map(attr => {
			let value = attr.entity == null
				? '<expression tag="Null"/>'
				: `<expression tag="${attr.entity}" Name="${Formulae.createExpression(attr.entity).specification.name}" Expanded="False"/>`;
			if (attr.multiple) value = `<expression tag="List.List">${value}</expression>`;
			return `<expression tag="Library.Attribute" Name="${attr.name}">${value}</expression>`;
		}).join("");
		return `<expression tag="${tag}" Name="${spec.name}" Expanded="True">${children}</expression>`;
	};

	Formulae.addEdition(this.messages.pathBook,                   entityIcon("Library.Book"),                    this.messages.leafBook,                    () => editionEntity("Library.Book"));
	Formulae.addEdition(this.messages.pathBookTitle,               entityIcon("Library.Book.Title"),              this.messages.leafBookTitle,               () => editionEntity("Library.Book.Title"));
	Formulae.addEdition(this.messages.pathBookAuthor,              entityIcon("Library.Book.Author"),             this.messages.leafBookAuthor,              () => editionEntity("Library.Book.Author"));
	Formulae.addEdition(this.messages.pathBookEdition,             entityIcon("Library.Book.Edition"),            this.messages.leafBookEdition,             () => editionEntity("Library.Book.Edition"));
	Formulae.addEdition(this.messages.pathBookPublication,         entityIcon("Library.Book.Publication"),        this.messages.leafBookPublication,         () => editionEntity("Library.Book.Publication"));
	Formulae.addEdition(this.messages.pathBookPhysicalDescription, entityIcon("Library.Book.PhysicalDescription"), this.messages.leafBookPhysicalDescription, () => editionEntity("Library.Book.PhysicalDescription"));

	// author type / participation: the tag stays exactly as originally serialized (Spanish, including the pre-existing "Oganización" typo); only the displayed label is localized
	[
		[ "Persona",     "Person" ],
		[ "Oganización", "Organization" ],
		[ "Pseudónimo",  "Pseudonym" ],
		[ "Anónimo",     "Anonymous" ]
	].forEach(([ tag, key ]) => {
		Formulae.addEdition(
			this.messages.pathBookAuthorType,
			`<expression tag="Library.Book.Author.Type.${tag}"/>`,
			this.messages["leafAuthorType" + key],
			() => Expression.replacingEdition("Library.Book.Author.Type." + tag)
		)
	});

	[
		[ "Escritor",   "Writer" ],
		[ "Traductor",  "Translator" ],
		[ "Editor",     "Editor" ],
		[ "Ilustrador", "Illustrator" ]
	].forEach(([ tag, key ]) => {
		Formulae.addEdition(
			this.messages.pathBookAuthorParticipation,
			`<expression tag="Library.Book.Author.Participation.${tag}"/>`,
			this.messages["leafParticipation" + key],
			() => Expression.replacingEdition("Library.Book.Author.Participation." + tag)
		)
	});

	// operations

	// GetAttribute wraps the selection but also needs a Name; the prompted name is unknown
	// ahead of time and directly IS the displayed text, so a generic placeholder word stands
	// in for it (reusing leafGetAttribute rather than adding a redundant key).
	Formulae.addEdition(
		this.messages.pathOperations,
		`<expression tag="Library.GetAttribute" Name="${this.messages.leafGetAttribute}"><expression tag="Visualization.Selected"><expression tag="Null"/></expression></expression>`,
		this.messages.leafGetAttribute,
		Library.editionGetAttribute
	);
	Formulae.addEdition(this.messages.pathOperations, Formulae.icon("Library.ValidateEntity", 1), this.messages.leafValidateEntity, () => Expression.wrapperEdition("Library.ValidateEntity"));
};

Library.setActions = function() {
	Formulae.addAction("Library.Book",                     Library.entityExpandCollapseAction);
	Formulae.addAction("Library.Book.Title",               Library.entityExpandCollapseAction);
	Formulae.addAction("Library.Book.Author",              Library.entityExpandCollapseAction);
	Formulae.addAction("Library.Book.Edition",             Library.entityExpandCollapseAction);
	Formulae.addAction("Library.Book.Publication",         Library.entityExpandCollapseAction);
	Formulae.addAction("Library.Book.PhysicalDescription", Library.entityExpandCollapseAction);

	Formulae.addAction("Library.GetAttribute", Library.actionGetAttribute);
};
