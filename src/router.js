const routers = [
    {
        path: '/',
        meta: {
            title: ''
        },
        component: (resolve) => require(['./views/index.vue'], resolve)
    },
    {
        path: '/bidding/:id',
        meta: {
            title: ''
        },
        component: (resolve) => require(['./views/biddingDetail.vue'], resolve)
    }
];
export default routers;