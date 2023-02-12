import Home from "../../views/Home.vue";
import {createRouter, createWebHistory} from "vue-router";

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/scan',
        name: 'scan',
        component: () => import('@/views/Scanner.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/site/NotFoundPage.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    // @ts-ignore
    routes: routes
})

export default router