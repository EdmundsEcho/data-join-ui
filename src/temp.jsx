<Routes>
   <Route path='login' element={<LoginPage />} />
   <Route path='home' element={<Home />} />
   <Route path='user-profile' element={<UserProfile />} />
   <Route path='projects' element={<Projects />}>
        <Route path=':projectId/*' element={<ProjectView />} />
   </Route>
   <Route path='*' element={<NoMatch />} />
</Routes>
<SubApp>
    <ReduxInitializer>
      <ErrorBoundary>
        <div className='box stack project-view'>
          <div className='app-paging-view'>
            <Outlet />
            <Routes>
              <Route path='files' element={<Files />} />
              <Route path='fields' element={<Fields />} />
              <Route path='workbench' element={<Workbench />} />
            </Routes>
          </div>
          <StepBar className='app-paging-controller' />
          <ModalRoot />
        </div>
      </ErrorBoundary>
    </ReduxInitializer>
</SubApp>
o

<Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
        {children}
    </PersistGate>
</Provider>
