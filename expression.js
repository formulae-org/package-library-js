/*
Fōrmulæ library package. Module for expression definition & visualization.
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

//////////////
// Entities //
//////////////

Library.Entity = class extends Expression {
	getTag() {
		return "Library.Entity";
	}

	getName() {
		return Library.messages.nameEntity;
	}

	canHaveChildren(count) {
		return true;
	}

	constructor() {
		super();
		this.name = Library.messages.defaultEntityName;
		this.expanded = true;
		this.error = false;
	}

	set(name, value) {
		switch (name) {
			case "Name"     : this.name     = value; return;
			case "Expanded" : this.expanded = value; return;
		}

		super.set(name, value);
	}

	get(name) {
		switch (name) {
			case "Name"     : return this.name;
			case "Expanded" : return this.expanded;
		}

		super.get(name);
	}

	getSerializationNames() {
		return [ "Name", "Expanded" ];
	}

	async getSerializationStrings() {
		return [ this.name, this.expanded ? "True" : "False" ];
	}

	setSerializationStrings(strings, promises) {
		if (strings[0].length == 0) {
			throw "Empty name";
		}

		if (strings[1] != "True" && strings[1] != "False") {
			throw "Invalid expansion state";
		}

		this.set("Name",     strings[0]);
		this.set("Expanded", strings[1] == "True");
	}

	prepareDisplay(context) {

		// collapsed

		if (!this.expanded) {
			this.width = 10 + Math.round(context.measureText(this.name).width) + 10;
			this.height = 10 + context.fontInfo.size + 10;

			this.vertBaseline = Math.round(this.width / 2);
			this.horzBaseline = Math.round(this.height / 2);

			let child;
			for (let i = 0, n = this.children.length; i < n; ++i) {
				child = this.children[i];
				child.x = child.y = Number.MIN_SAFE_INTEGER;
			}

			return;
		}

		// expanded

		let widthTitle = 10 + Math.round(context.measureText(this.name).width) + 10;
		let i, n = this.children.length;
		let child;
		let maxSemiHeight;
		let s, m;

		this.vertBaseline = 0;
		this.width = 0;
		this.height = 10 + context.fontInfo.size + 20;

		for (i = 0; i < n; ++i) {
			child = this.children[i];
			child.prepareDisplay(context);

			// attribute name
			s = child.getTag() === "Library.Attribute" ? child.get("Name") : "???";
			m = Math.round(context.measureText(s).width);
			if (m > this.vertBaseline) this.vertBaseline = m;

			// attribute wdith
			if (child.width > this.width) this.width = child.width;

			//child.y = this.height;
			maxSemiHeight = Math.max(context.fontInfo.semiHeight, child.horzBaseline);
			this.height += maxSemiHeight;
			child.y = this.height - child.horzBaseline;
			this.height += Math.max(context.fontInfo.semiHeight, child.height - child.horzBaseline) + 10;
		}

		//this.height += 10;
		this.vertBaseline += 20;

		this.width = this.vertBaseline + this.width + 10;

		if (widthTitle > this.width) {
			this.width = widthTitle;
		}

		for (i = 0; i < n; ++i) {
			this.children[i].x = this.vertBaseline;
		}

		this.horzBaseline = Math.round(this.height / 2);
	}

	display(context, x, y) {
		if (!this.expanded) { // collapsed
			let bkpFillStyle = context.fillStyle;
			context.fillStyle = "orange";
			context.fillRect(x, y, this.width, this.height);
			context.fillStyle = bkpFillStyle;

			let bkpStrokeStyle = context.strokeStyle;
			if (this.error) context.strokeStyle = "red";
			context.strokeRect(x + 0.5, y + 0.5, this.width - 1, this.height - 1);
			super.drawText(context, this.name, x + 10, y + 10 + context.fontInfo.size);
			context.strokeStyle = bkpStrokeStyle;

			return;
		}

		// expanded

		let i, n = this.children.length;
		let child;
		let s;

		super.drawText(context, this.name, x + 10, y + 10 + context.fontInfo.size);

		for (i = 0; i < n; ++i) {
			child = this.children[i];

			s = child.getTag() === "Library.Attribute" ? child.get("Name") : "???";
			super.drawText(
				context,
				s,
				x + 10,
				y + child.y + child.horzBaseline + context.fontInfo.semiHeight
			);

			child.display(context, x + child.x, y + child.y);
		}

		// strokes

		let bkpStrokeStyle = context.strokeStyle;
		if (this.error) context.strokeStyle = "red";
		context.strokeRect(x + 0.5, y + 0.5, this.width - 1, this.height - 1);

		context.beginPath();
		context.moveTo(x, y + 20.5 + context.fontInfo.size);
		context.lineTo(x + this.width, y + 20.5 + context.fontInfo.size);
		context.stroke();
		context.strokeStyle = bkpStrokeStyle;
	}

	moveAcross(son, direction) {
		if (direction == Expression.UP) {
			if (son != 0) {
				return this.children[son - 1].moveTo(direction);
			}
		}
		else if (direction == Expression.DOWN) {
			if (son != this.children.length - 1) {
				return this.children[son + 1].moveTo(direction);
			}
		}

		return this.moveOut(direction);
	}

	moveTo(direction) {
		if (!this.expanded) {
			return this;
		}

		if (direction == Expression.UP) {
			return this.children[this.children.length - 1].moveTo(direction);
		}
		else {
			return this.children[0].moveTo(direction);
		}
	}
};

Library.ConcreteEntity = class extends Library.Entity {
	create() {
		this.name = this.specification.name;

		let attributeExpression;
		let attribute;

		for (let i = 0; i < this.specification.attributes.length; ++i) {
			attribute = this.specification.attributes[i];

			attributeExpression = Formulae.createExpression("Library.Attribute");
			attributeExpression.set("Name", attribute.name);

			if (attribute.entity == null) {
				attributeExpression.addChild(Formulae.createExpression("Null"));
			}
			else {
				let e = Formulae.createExpression(attribute.entity);
				e.create();
				e.set("Expanded", false);
				attributeExpression.addChild(e);
			}

			if (attribute.multiple) {
				let e = attributeExpression.children[0];
				let list = Formulae.createExpression("List.List");
				list.addChild(e);
				attributeExpression.setChild(0, list);
			}

			this.addChild(attributeExpression);
		}
	}

	validation() {
		let error = false;
		let attribute;

		for (let i = 0, n = this.specification.attributes.length; i < n; ++i) {
			attribute = this.specification.attributes[i];

			if (attribute.entity !== null) { // attribute is an entity
				if (!attribute.multiple) { // simple
					this.children[i].children[0].validation();
				}
				else { // multiple
					let list = this.children[i].children[0];
					for (let j = 0, m = list.children.length; j < m; ++j) {
						console.log(list.children[j].getTag());
						error |= list.children[j].validation();
					}
				}
			}
		}

		return error;
	}
};

Library.Book = class extends Library.ConcreteEntity {
	getTag() {
		return "Library.Book";
	}

	constructor() {
		super();

		this.specification = {
			name: Library.messages.entityBook,
			attributes: [
				{ name: Library.messages.attrBookTitle,               multiple: false, entity: "Library.Book.Title" },
				{ name: Library.messages.attrBookAuthors,             multiple: true,  entity: "Library.Book.Author" },
				{ name: Library.messages.attrBookEdition,             multiple: false, entity: "Library.Book.Edition" },
				{ name: Library.messages.attrBookPublication,         multiple: false, entity: "Library.Book.Publication" },
				{ name: Library.messages.attrBookPhysicalDescription, multiple: false, entity: "Library.Book.PhysicalDescription" },
			]
		};
	}

	validation() {
		this.error = false;

		let expr = this.children[0].children[0]; // title
		if (expr.getTag() !== "String.String") {
			ReductionManager.setInError(expr, Library.messages.errorMustBeString);
			this.error = true;
		}

		expr = this.children[2].children[0]; // number of pages
		if (expr.getTag() !== "Math.InternalNumber") {
			ReductionManager.setInError(expr, Library.messages.errorMustBeNumber);
			this.error = true;
		}

		this.error |= super.validation();
		return this.error;
	}
};

Library.Book.Title = class extends Library.ConcreteEntity {
	getTag() {
		return "Library.Book.Title";
	}

	constructor() {
		super();

		this.specification = {
			name: Library.messages.entityBookTitle,
			attributes: [
				{ name: Library.messages.attrTitleIndividual,  multiple: false, entity: null },
				{ name: Library.messages.attrTitleCollective,  multiple: true,  entity: null },
				{ name: Library.messages.attrTitleParallel,    multiple: false, entity: null },
				{ name: Library.messages.attrSubtitle,         multiple: false, entity: null },
				{ name: Library.messages.attrTitleIndependent, multiple: false, entity: null },
				{ name: Library.messages.attrNotes,            multiple: false, entity: null },
			]
		};
	}

	validation() {
		return true;
	}
};

Library.Book.Author = class extends Library.ConcreteEntity {
	getTag() {
		return "Library.Book.Author";
	}

	constructor() {
		super();

		this.specification = {
			name: Library.messages.entityBookAuthor,
			attributes: [
				{ name: Library.messages.attrName,          multiple: false, entity: null },
				{ name: Library.messages.attrAuthorType,    multiple: false, entity: null },
				{ name: Library.messages.attrParticipation, multiple: false, entity: null },
				{ name: Library.messages.attrNotes,         multiple: false, entity: null },
			]
		};
	}

	validation() {
		this.error = false;

		let expr = this.children[0].children[0]; // full type
		if (!expr.getTag().startsWith("Library.Book.Author.Type.")) {
			ReductionManager.setInError(expr, Library.messages.errorMustBeAuthorType);
			this.error = true;
		}

		expr = this.children[1].children[0]; // full name
		if (expr.getTag() !== "String.String") {
			ReductionManager.setInError(expr, Library.messages.errorMustBeString);
			this.error = true;
		}

		this.error |= super.validation();
		return this.error;
	}
};

Library.Book.Edition = class extends Library.ConcreteEntity {
	getTag() {
		return "Library.Book.Edition";
	}

	constructor() {
		super();

		this.specification = {
			name: Library.messages.entityBookEdition,
			attributes: [
				{ name: Library.messages.attrName,  multiple: false, entity: null },
				{ name: Library.messages.attrNotes, multiple: false, entity: null },
			]
		};
	}

	validation() {
		return true;
	}
};

Library.Book.Publication = class extends Library.ConcreteEntity {
	getTag() {
		return "Library.Book.Publication";
	}

	constructor() {
		super();

		this.specification = {
			name: Library.messages.entityBookPublication,
			attributes: [
				{ name: Library.messages.attrPlace, multiple: false, entity: null },
				{ name: Library.messages.attrDate,  multiple: false, entity: null },
				{ name: Library.messages.attrNotes, multiple: false, entity: null },
			]
		};
	}

	validation() {
		return true;
	}
};

Library.Book.PhysicalDescription = class extends Library.ConcreteEntity {
	getTag() {
		return "Library.Book.PhysicalDescription";
	}

	constructor() {
		super();

		this.specification = {
			name: Library.messages.entityBookPhysicalDescription,
			attributes: [
				{ name: Library.messages.attrExtent,               multiple: false, entity: null },
				{ name: Library.messages.attrIllustrations,        multiple: false, entity: null },
				{ name: Library.messages.attrFormatAndDimensions,  multiple: false, entity: null },
				{ name: Library.messages.attrAccompanyingMaterial, multiple: false, entity: null },
				{ name: Library.messages.attrNotes,                multiple: false, entity: null },
			]
		};
	}

	validation() {
		return true;
	}
};

////////////////
// Attributes //
////////////////

Library.Attribute = class extends Expression.UnaryExpression {
	getTag() {
		return "Library.Attribute";
	}

	getName() {
		return Library.messages.nameAttribute;
	}

	constructor() {
		super();
		this.name = Library.messages.defaultAttributeName;
	}

	set(name, value) {
		if (name == "Name") {
			this.name = value;
		}
		else {
			super.set(name, value);
		}
	}

	get(name) {
		if (name == "Name") {
			return this.name;
		}

		return super.get(name);
	}

	getSerializationNames() {
		return [ "Name" ];
	}

	async getSerializationStrings() {
		return [ this.name ];
	}

	setSerializationStrings(strings, promises) {
		this.name = strings[0];
	}

	prepareDisplay(context) {
		let child = this.children[0];
		child.prepareDisplay(context);
		child.x = child.y = 0;

		this.width = child.width;
		this.height = child.height;
		this.horzBaseline = child.horzBaseline;
		this.vertBaseline = child.vertBaseline;
	}

	display(context, x, y) {
		this.children[0].display(context, x, y);
	}
};

///////////////////
// Get attribute //
///////////////////

Library.GetAttribute = class extends Expression.UnaryExpression {
	getTag() { return "Library.GetAttribute"; }
	getName() { return Library.messages.nameGetAttribute; }

	set(name, value) {
		if (name == "Name") {
			this.name = value;
		}
		else {
			super.set(name, value);
		}
	}

	get(name) {
		if (name == "Name") {
			return this.name;
		}

		return super.get(name);
	}

	getSerializationNames() {
		return [ "Name" ];
	}

	async getSerializationStrings() {
		return [ this.name ];
	}

	setSerializationStrings(strings, promises) {
		this.name = strings[0];
	}

	prepareDisplay(context) {
		let entity = this.children[0];
		entity.prepareDisplay(context);

		entity.x = 0;
		this.width = entity.width + Math.ceil(context.measureText(" • " + this.name).width);

		this.horzBaseline = Math.max(entity.horzBaseline, context.fontInfo.semiHeight);
		let maxSemiHeight = Math.max(entity.height - entity.horzBaseline, context.fontInfo.semiHeight);

		this.height = this.horzBaseline + maxSemiHeight;
		entity.y = this.horzBaseline - entity.horzBaseline;

		this.vertBaseline = Math.ceil(this.width / 2);
	}

	display(context, x, y) {
		let entity = this.children[0];

		entity.display(context, x + entity.x, y + entity.y);
		super.drawText(context, " • " + this.name, x + entity.width, y + this.horzBaseline + context.fontInfo.semiHeight);
	}
}

Library.setExpressions = function(module) {
	Formulae.setExpression(module, "Library.Book",                     Library.Book);
	Formulae.setExpression(module, "Library.Book.Title",               Library.Book.Title);
	Formulae.setExpression(module, "Library.Book.Author",              Library.Book.Author);
	Formulae.setExpression(module, "Library.Book.Edition",             Library.Book.Edition);
	Formulae.setExpression(module, "Library.Book.Publication",         Library.Book.Publication);
	Formulae.setExpression(module, "Library.Book.PhysicalDescription", Library.Book.PhysicalDescription);

	// tag stays exactly as originally serialized (Spanish, including the pre-existing "Oganización" typo); only the displayed label is localized
	[
		[ "Persona",     "Person" ],
		[ "Oganización", "Organization" ],
		[ "Pseudónimo",  "Pseudonym" ],
		[ "Anónimo",     "Anonymous" ]
	].forEach(
		([ tag, key ]) => Formulae.setExpression(module, "Library.Book.Author.Type." + tag, {
			clazz   : Expression.LabelExpression,
			getTag  : () => "Library.Book.Author.Type." + tag,
			getLabel: () => Library.messages["leafAuthorType" + key],
			getName : () => Library.messages.nameAuthorTypePrefix + Library.messages["leafAuthorType" + key]
		}
	));

	[
		[ "Escritor",   "Writer" ],
		[ "Traductor",  "Translator" ],
		[ "Editor",     "Editor" ],
		[ "Ilustrador", "Illustrator" ]
	].forEach(
		([ tag, key ]) => Formulae.setExpression(module, "Library.Book.Author.Participation." + tag, {
			clazz   : Expression.LabelExpression,
			getTag  : () => "Library.Book.Author.Participation." + tag,
			getLabel: () => Library.messages["leafParticipation" + key],
			getName : () => Library.messages.nameParticipationPrefix + Library.messages["leafParticipation" + key]
		}
	));

	Formulae.setExpression(module, "Library.Attribute",    Library.Attribute);
	Formulae.setExpression(module, "Library.GetAttribute", Library.GetAttribute);
	Formulae.setExpression(module, "Library.ValidateEntity", {
		clazz:       Expression.Function,
		getTag:      () => "Library.ValidateEntity",
		getMnemonic: () => Library.messages.mnemonicValidateEntity,
		getName:     () => Library.messages.nameValidateEntity
	});
};
