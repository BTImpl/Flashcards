export interface HeaderModel {
    user: UsersEnum;
    list: KnownUnknownEnum;
}

export enum KnownUnknownEnum {
    KNOWN = 'known',
    UNKNOWN = 'unknown'
}

export enum UsersEnum {
    GABI = 'Gabi',
    TOMI = 'Tomi'
}
