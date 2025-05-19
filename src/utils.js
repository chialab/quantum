/**
 * @typedef {Omit<PropertyDescriptor, 'get'> & Required<Pick<PropertyDescriptor, 'get'>>} GetterDescriptor
 */

/**
 * @typedef {Omit<PropertyDescriptor, 'set'> & Required<Pick<PropertyDescriptor, 'set'>>} SetterDescriptor
 */

/**
 * @typedef {Omit<PropertyDescriptor, 'value'> & Required<Pick<PropertyDescriptor, 'value'>>} ValueDescriptor
 */

export const { defineProperty, getOwnPropertyDescriptors } = Object;
