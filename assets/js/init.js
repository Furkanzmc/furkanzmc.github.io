const gitalk = new Gitalk({
    clientID: '9636625723440c90efd5',
    clientSecret: '9d484415b6c004ac58333cf773adf32885688c25',
    repo: 'zmc.space.comments',
    owner: 'Furkanzmc',
    admin: ['Furkanzmc'],
    distractionFreeMode: true
})

gitalk.render('gitalk-container')

