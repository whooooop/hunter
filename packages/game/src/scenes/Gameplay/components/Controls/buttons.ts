import { changeWeaponDescriptionText, jumpTitleText, nextWeaponTitleText, pauseTitleText, prevWeaponTitleText, reloadDescriptionText, reloadTitleText, shootTitleText, shopDescriptionText, shopTitleText } from "./translates";

export const actionButton = [
  {
    key: 'E',
    title: shopTitleText,
    description: shopDescriptionText
  },
  {
    key: 'F',
    title: shootTitleText,
  },
  {
    key: 'R',
    title: reloadTitleText,
    description: reloadDescriptionText
  },
  {
    key: 'C',
    title: nextWeaponTitleText,
    description: changeWeaponDescriptionText
  },
  {
    key: 'X',
    title: prevWeaponTitleText,
    description: changeWeaponDescriptionText
  },
  {
    key: 'SPACE',
    title: jumpTitleText,
  },
  {
    key: 'P',
    title: pauseTitleText,
  },
]
