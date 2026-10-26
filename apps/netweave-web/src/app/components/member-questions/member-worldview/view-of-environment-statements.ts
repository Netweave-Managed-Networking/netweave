import { ViewOfEnvironmentItemId } from '@netweave/api-types';

/** display texts per question; the Record type ensures no statement is missing */
export const VIEW_OF_ENVIRONMENT_STATEMENTS: Record<
  ViewOfEnvironmentItemId,
  string
> = {
  UA1: 'Die Erde ist begrenzt. Deshalb können Bevölkerung, Konsum und Produktion nicht immer weiter wachsen.',
  UA2: 'Neue Technik, sparsamer Verbrauch und Ersatzmaterialien können dafür sorgen, dass knappe Rohstoffe deutlich länger reichen.',
  UA3: 'Menschen dürfen die Natur verändern, wenn es der Gesellschaft hilft und die Schäden so klein wie möglich bleiben.',
  UA4: 'Tiere, Pflanzen und Lebensräume sollen auch dann geschützt werden, wenn Menschen keinen direkten Vorteil davon haben.',
  UA5: 'Eingriffe in die Natur haben oft Folgen, die man vorher nur schwer abschätzen kann.',
  UA6: 'Mit guter Planung und Kontrolle können wir die Folgen der meisten Eingriffe in die Natur klein halten.',
  UA7: 'Wir verbrauchen heute mehr Flächen und Rohstoffe, als die Natur erneuern oder ausgleichen kann.',
  UA8: 'In der öffentlichen Diskussion werden Umweltprobleme oft größer dargestellt, als sie tatsächlich sind.',
  UA9: 'Viele natürliche Lebensräume können sich auch nach starker Belastung wieder erholen, wenn sie danach genug Zeit und Raum bekommen.',
  UA10: 'Werden natürliche Lebensräume zu stark belastet, können sie sich dauerhaft verändern.',
};
