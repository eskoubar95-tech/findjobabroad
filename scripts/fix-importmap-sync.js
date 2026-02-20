/**
 * Fix the sync page import path in importMap.js.
 * Payload generate:importmap writes a path that does not resolve from the importMap file location.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const importMapPath = path.join(dir, '..', 'src', 'app', '(payload)', 'admin', 'importMap.js')
let content = fs.readFileSync(importMapPath, 'utf8')
content = content.replace(
  /from ['"].*?sync\/page['"]/g,
  "from './sync/page'"
)
fs.writeFileSync(importMapPath, content)
console.log('Fixed sync page import in importMap.js')
