import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";





type EagerContact = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Contact, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyContact = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Contact, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Contact = LazyLoading extends LazyLoadingDisabled ? EagerContact : LazyContact

export declare const Contact: (new (init: ModelInit<Contact>) => Contact) & {
  copyOf(source: Contact, mutator: (draft: MutableModel<Contact>) => MutableModel<Contact> | void): Contact;
}