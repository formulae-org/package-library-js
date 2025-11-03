/*
Fōrmulæ library package. Module for expression definition & visualization.
Copyright (C) 2015-2025 Laurence R. Ugalde

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

'use strict';

export class Library extends Formulae.Package {}

//////////////
// Entities //
//////////////

Library.Entity = class extends Expression {
	getTag() {
		return "Library.Entity";
	}
	
	getName() {
		return "Library entity";
	}
	
	canHaveChildren(count) {
		return true;
	}
	
	constructor() {
		super();
		this.name = "Entity X";
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
		if (!this.expanded) { // collapsed
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
			name: "Book",
			attributes: [
				{ name: "Title",           multiple: false, entity: null },
				{ name: "Authors",         multiple: true,  entity: "Library.Book.Author" },
				{ name: "Number of pages", multiple: false, entity: null }
			]
		};
	}
	
	validation() {
		this.error = false;
		
		let expr = this.children[0].children[0]; // title
		if (expr.getTag() !== "String.String") {
			ReductionManager.setInError(expr, "Expression must be a string");
			this.error = true;
		}
		
		expr = this.children[2].children[0]; // number of pages
		if (expr.getTag() !== "Math.InternalNumber") {
			ReductionManager.setInError(expr, "Expression must be a number");
			this.error = true;
		}
		
		this.error |= super.validation();
		return this.error;
	}
};

Library.Book.Author = class extends Library.ConcreteEntity {
	getTag() {
		return "Library.Book.Author";
	}
	
	constructor() {
		super();
		
		this.specification = {
			name: "Author",
			attributes: [
				{ name: "Type",      multiple: false, entity: null },
				{ name: "Full name", multiple: false, entity: null }
			]
		};
	}
	
	validation() {
		this.error = false;
		
		let expr = this.children[0].children[0]; // full type
		if (!expr.getTag().startsWith("Library.Book.Author.Type.")) {
			ReductionManager.setInError(expr, "Expression must be an author type");
			this.error = true;
		}
		
		expr = this.children[1].children[0]; // full name
		if (expr.getTag() !== "String.String") {
			ReductionManager.setInError(expr, "Expression must be a string");
			this.error = true;
		}
		
		this.error |= super.validation();
		return this.error;
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
		return "Attribute";
	}
	
	constructor() {
		super();
		this.name = "Atribute X";
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
	getName() { return "Attribute"; }
	
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
	Formulae.setExpression(module, "Library.Book",        Library.Book);
	Formulae.setExpression(module, "Library.Book.Author", Library.Book.Author);
	
	[ "Person", "Organization", "Pseudonym", "Anonymous" ].forEach(
		tag => Formulae.setExpression(module, "Library.Book.Author.Type." + tag, {
			clazz   : Expression.LabelExpression,
			getTag  : () => "Library.Book.Author.Type." + tag,
			getLabel: () => tag,
			getName : () => tag + " author type"
		}
	));
	
	Formulae.setExpression(module, "Library.Attribute",    Library.Attribute);
	Formulae.setExpression(module, "Library.GetAttribute", Library.GetAttribute);
	Formulae.setExpression(module, "Library.ValidateEntity", {
		clazz:       Expression.Function,
		getTag:      () => "Library.ValidateEntity",
		getMnemonic: () => "ValidateEntity",
		getName:     () => "Validate entity"
	});
};

