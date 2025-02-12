import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { existsSync, readdirSync, lstatSync, rmdirSync, unlinkSync } from 'fs'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import dts from 'vite-plugin-dts'
const pkg = require('./package.json')

emptyDir(resolve(__dirname, 'types'))
const banner = `/*!
* ${pkg.name} v${pkg.version}
* ${new Date().getFullYear()}年${new Date().getMonth() + 1}月${new Date()}
* 制作
*/`
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [path.resolve(process.cwd(), 'src/icons')],
      // 指定symbolId格式
      symbolId: 'icon-[dir]-[name]'
    }),
    // viteSvgIcons({
    //   // config svg dir that can config multi
    //   iconDirs: [resolve(process.cwd(), 'src/icons/nav')],
    //   // appoint svg icon using mode
    //   symbolId: 'icon-[dir]-[name]'
    // }),
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass'
        })
      ],
      dts: 'src/components.d.ts'
    }),
    dts({
      outputDir: 'lib/types',
      staticImport: true,
      insertTypesEntry: true,
      logDiagnostics: true
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname)
    }
  },
  build: {
    outDir: 'lib',
    // minify: true, // 不压缩代码,方便开发调试
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SketchRuler',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        banner,
        exports: 'auto'
      }
    }
  }
})

function emptyDir(dir) {
  if (!existsSync(dir)) {
    return
  }

  for (const file of readdirSync(dir)) {
    const abs = resolve(dir, file)

    // baseline is Node 12 so can't use rmSync
    if (lstatSync(abs).isDirectory()) {
      emptyDir(abs)
      rmdirSync(abs)
    } else {
      unlinkSync(abs)
    }
  }
}
