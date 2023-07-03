/**
 * @typedef {Omit<PropertyDescriptor, 'get'> & Required<Pick<PropertyDescriptor, 'get'>>} GetterDescriptor
 */

/**
 * @typedef {Omit<PropertyDescriptor, 'value'> & Required<Pick<PropertyDescriptor, 'value'>>} ValueDescriptor
 */

export const { defineProperty } = Object;
