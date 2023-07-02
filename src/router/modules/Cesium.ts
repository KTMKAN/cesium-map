import { RouteRecordRaw } from 'vue-router'
import CesiumView from '@/views/CesiumView.vue'
import CesiumView2 from '@/views/CesiumView2.vue'
import CesiumView3 from '@/views/CesiumView3.vue'
import CesiumView4 from '@/views/CesiumView4.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/cesiumview',
    name: 'CesiumView',
    component: CesiumView
  },
  {
    path: '/cesiumview2',
    name: 'CesiumView2',
    component: CesiumView2
  },
  {
    path: '/cesiumview3',
    name: 'CesiumView3',
    component: CesiumView3
  },
  {
    path: '/cesiumview4',
    name: 'CesiumView4',
    component: CesiumView4
  },
]

export default routes
