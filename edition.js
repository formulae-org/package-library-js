/*
Fōrmulæ library package. Module for edition.
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
	getDescription: () => "Expand/collapse entity",
	doAction: () => {
		Formulae.sExpression.expanded = !Formulae.sExpression.expanded;
		
		Formulae.sHandler.prepareDisplay();
		Formulae.sHandler.display();
		Formulae.setSelected(Formulae.sHandler, Formulae.sExpression, false);
	}
};

Library.editionGetAttribute = function() {
	let s = prompt("Enter attribute's name");
	
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
	getDescription: () => "Expand/collapse entity",
	doAction: () => {
		let s = Formulae.sExpression.get("Name");
		s = prompt("Enter attributes's name", s);
		
		if (s == null) return;
		
		Formulae.sExpression.set("Name", s);
		
		Formulae.sHandler.prepareDisplay();
		Formulae.sHandler.display();
		Formulae.setSelected(Formulae.sHandler, Formulae.sExpression, false);
	}
};

Library.setEditions = function() {
	Formulae.addEdition("Library.Book",        null, "Book",   () => editionEntity("Library.Book"));
	Formulae.addEdition("Library.Book.Author", null, "Author", () => editionEntity("Library.Book.Author"));
	
	[ "Person", "Organization", "Pseudonym", "Anonymous" ].forEach(tag => {
		Formulae.addEdition(
			"Library.Book.Author.Type",
			null,
			tag,
			() => Expression.replacingEdition("Library.Book.Author.Type." + tag)
		)
	});
	
	// operations
	
	Formulae.addEdition("Library.Operations", null, "GetAttribute",   Library.editionGetAttribute);
	Formulae.addEdition("Library.Operations", null, "ValidateEntity", () => Expression.wrapperEdition("Library.ValidateEntity"));
};

Library.setActions = function() {
	Formulae.addAction("Library.Book",         Library.entityExpandCollapseAction);
	Formulae.addAction("Library.Book.Author",  Library.entityExpandCollapseAction);
	Formulae.addAction("Library.GetAttribute", Library.actionGetAttribute);
};

