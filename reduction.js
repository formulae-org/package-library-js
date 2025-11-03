/*
Fōrmulæ library package. Module for reduction.
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

const getAttribute = async (getAttribute, session) => {
	let entity = getAttribute.children[0];
	if (!("specification" in entity)) {
		ReductionManager.setInError(entity, "Expression is not an entity");
		throw new ReductionError();
	}
	
	let name = getAttribute.get("Name");
	
	let child;
	let attribute = null;
	
	cycle: for (let i = 0, n = entity.children.length; i < n; ++i) {
		child = entity.children[i];
		if (child.getTag() !== "Library.Attribute") continue cycle;
		
		if (child.get("Name") === name) {
			attribute = child.children[0];
			break cycle;
		}
	}
	
	if (attribute === null) {
		ReductionManager.setInError(entity, "Entity does not contain the attribute");
		throw new ReductionError();
	}
	
	getAttribute.replaceBy(attribute.clone());
	return true;
};

const validateEntity = async (validateEntity, session) => {
	let entity = validateEntity.children[0];
	if (!("specification" in entity)) {
		ReductionManager.setInError(entity, "Expression is not an entity");
		throw new ReductionError();
	}
	
	entity.validation();
	validateEntity.replaceBy(entity);
	return true;
};

Library.setReducers = () => {
	ReductionManager.addReducer("Library.GetAttribute",   getAttribute,   "Library.getAttribute");
	ReductionManager.addReducer("Library.ValidateEntity", validateEntity, "Library.validateEntity");
};

