import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";

const here = dirname(process.argv[1] || ".");
const files = readdirSync(here).filter(f => f.endsWith(".sql"));
const schema = files.map(f => readFileSync(join(here, f), "utf8")).join("\n");

function tableCols(t){
  const re = new RegExp(`create table (?:if not exists )?public\\.${t}\\s*\\(`, "i");
  const m = schema.match(re);
  if(!m) return [];
  const s = m.index + m[0].length;
  const b = schema.slice(s, s + 6000);
  const e = b.indexOf("\n);");
  const blk = e > 0 ? b.slice(0, e) : b;
  return [...blk.matchAll(/^\s{2}(\w+)\s+\w/gm)].map(x => x[1]);
}

const cols = new Set();
for (const t of ["profiles","saving_goals","saving_transactions","integrity_events","families","family_members","family_missions","family_mission_contributions"]){
  for (const c of tableCols(t)){ cols.add(c); }
}
console.log(cols.has('mission_id'));
console.log([...cols].filter(x=>x.includes('mission')).sort());
