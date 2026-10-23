package app.mindcircle.android.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import app.mindcircle.android.R
import app.mindcircle.android.core.AppViewModel
import app.mindcircle.android.data.ACTIVITIES
import app.mindcircle.android.ui.screens.ActivitiesScreen
import app.mindcircle.android.ui.screens.ActivityDetailScreen
import app.mindcircle.android.ui.screens.CrisisScreen
import app.mindcircle.android.ui.screens.ChatsScreen
import app.mindcircle.android.ui.screens.DiscoverScreen
import app.mindcircle.android.ui.screens.HomeScreen
import app.mindcircle.android.ui.screens.InsightsScreen
import app.mindcircle.android.ui.screens.JournalDetailScreen
import app.mindcircle.android.ui.screens.JournalScreen
import app.mindcircle.android.ui.screens.JournalWriteScreen
import app.mindcircle.android.ui.screens.LoginScreen
import app.mindcircle.android.ui.screens.OnboardingScreen
import app.mindcircle.android.ui.screens.NewChatScreen
import app.mindcircle.android.ui.screens.RoomScreen
import app.mindcircle.android.ui.screens.AssessmentScreen
import app.mindcircle.android.ui.screens.ConnectScreen
import app.mindcircle.android.ui.screens.AboutScreen
import app.mindcircle.android.ui.screens.ChangePasswordScreen
import app.mindcircle.android.ui.screens.EditProfileScreen
import app.mindcircle.android.ui.screens.FaqScreen
import app.mindcircle.android.ui.screens.SettingsScreen
import app.mindcircle.android.ui.screens.SupportScreen
import app.mindcircle.android.ui.screens.ShellPlaceholder
import app.mindcircle.android.ui.theme.Palette
import kotlinx.coroutines.launch

/** Destinations, kept in one place so the drawer and bottom bar agree. */
object Routes {
    const val HOME = "home"
    const val JOURNAL = "journal"
    const val JOURNAL_WRITE = "journal/write"
    const val JOURNAL_ENTRY = "journal/{id}"
    const val ASSESSMENT = "assessment"
    const val CONNECT = "connect"
    const val DISCOVER = "discover"
    const val CHATS = "chats"
    const val NEW_CHAT = "chats/new"
    const val ROOM = "room/{roomId}"
    const val DM = "dm/{peerId}"
    const val INSIGHTS = "insights"
    const val ACTIVITIES = "activities"
    const val ACTIVITY_DETAIL = "activities/{activityId}"
    const val COUNSELLORS = "counsellors"
    const val SETTINGS = "settings"
    const val ONBOARDING = "onboarding"
    const val EDIT_PROFILE = "settings/edit-profile"
    const val CHANGE_PASSWORD = "settings/change-password"
    const val HELP_FAQ = "help/faq"
    const val HELP_SUPPORT = "help/support"
    const val HELP_ABOUT = "help/about"
    const val CRISIS = "crisis"

    fun room(id: String) = "room/$id"
    fun dm(id: String) = "dm/$id"
    fun activity(id: String) = "activities/$id"
    fun entry(id: String) = "journal/$id"
}

/** Bar title per top-level route. Absent keys (parameterised routes) keep
 *  whatever the navigation call set. Settings is blank because its screen
 *  draws its own large heading. */
private val ROUTE_TITLES = mapOf(
    Routes.HOME to "MindCircle",
    Routes.JOURNAL to "Journal",
    Routes.JOURNAL_WRITE to "Journal",
    Routes.ASSESSMENT to "Check-in",
    Routes.CONNECT to "Connect",
    Routes.DISCOVER to "Discover",
    Routes.CHATS to "Chats",
    Routes.NEW_CHAT to "New chat",
    Routes.INSIGHTS to "Insights",
    Routes.ACTIVITIES to "Activities",
    Routes.COUNSELLORS to "Counsellors",
    Routes.SETTINGS to "",
    // The Settings sub-pages draw their own headings too, like Settings does.
    Routes.EDIT_PROFILE to "",
    Routes.ONBOARDING to "Profile setup",
    Routes.CHANGE_PASSWORD to "",
    Routes.HELP_FAQ to "",
    Routes.HELP_SUPPORT to "",
    Routes.HELP_ABOUT to "",
    Routes.CRISIS to "Crisis Support",
)

/** The five items that get a bottom-nav slot, matching the web's NAV_ITEMS. */
private data class BottomItem(val route: String, val label: String, val icon: Int)

// The web's NAV_ITEMS, with lucide line icons ported to vector drawables by
// scripts/convert-icons.mjs — not emoji, which never match the web's weight.
private val bottomItems = listOf(
    BottomItem(Routes.HOME, "Home", R.drawable.ic_home),
    BottomItem(Routes.JOURNAL, "Journal", R.drawable.ic_journal),
    BottomItem(Routes.CONNECT, "Connect", R.drawable.ic_connect),
    BottomItem(Routes.DISCOVER, "Discover", R.drawable.ic_discover),
    BottomItem(Routes.CHATS, "Chats", R.drawable.ic_chats),
)

/** Everything reachable from the drawer — the web's SIDEBAR_ITEMS. */
private data class DrawerItem(val route: String, val label: String, val icon: Int)

private val drawerItems = listOf(
    DrawerItem(Routes.HOME, "Home", R.drawable.ic_home),
    DrawerItem(Routes.JOURNAL, "Journal", R.drawable.ic_journal),
    DrawerItem(Routes.CONNECT, "Connect", R.drawable.ic_connect),
    DrawerItem(Routes.DISCOVER, "Discover", R.drawable.ic_discover),
    DrawerItem(Routes.INSIGHTS, "Insights", R.drawable.ic_insights),
    DrawerItem(Routes.CHATS, "Chats", R.drawable.ic_chats),
    DrawerItem(Routes.ACTIVITIES, "Activities", R.drawable.ic_activities),
    DrawerItem(Routes.COUNSELLORS, "Counsellors", R.drawable.ic_counsellors),
    DrawerItem(Routes.SETTINGS, "Settings", R.drawable.ic_settings),
    DrawerItem(Routes.CRISIS, "Crisis Support", R.drawable.ic_crisis),
)

/** The drawer's second group — the web's SUPPORT section. */
private data class SupportItem(val label: String, val icon: Int)

private val supportItems = listOf(
    SupportItem("About", R.drawable.ic_about),
    SupportItem("FAQ", R.drawable.ic_faq),
    SupportItem("Contact Support", R.drawable.ic_support),
    SupportItem("Edit Profile", R.drawable.ic_profile),
    SupportItem("Change Password", R.drawable.ic_password),
)

/** Root: chooses between sign-in and the signed-in app shell. */
@Composable
fun AppRoot() {
    val viewModel: AppViewModel = viewModel()
    val context = LocalContext.current
    LaunchedEffect(Unit) { viewModel.attach(context) }

    val state by viewModel.state.collectAsState()
    when (val current = state) {
        is AppViewModel.AuthState.Loading -> LoadingGate()
        is AppViewModel.AuthState.SignedOut -> LoginScreen(viewModel)
        is AppViewModel.AuthState.SignedIn -> AppScaffold(viewModel, current)
    }
}

@Composable
private fun LoadingGate() {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            // The web's mark, not a brain emoji.
            Image(
                painter = painterResource(R.drawable.logo),
                contentDescription = null,
                contentScale = ContentScale.Fit,
                modifier = Modifier.size(56.dp),
            )
            Spacer(Modifier.height(12.dp))
            Text("MindCircle", style = MaterialTheme.typography.titleMedium, color = Palette.Plum)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AppScaffold(viewModel: AppViewModel, state: AppViewModel.AuthState.SignedIn) {
    val navController = rememberNavController()
    val drawerState = rememberDrawerState(DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    var title by rememberSaveable { mutableStateOf("MindCircle") }
    var showBack by remember { mutableStateOf(false) }

    val startDestination = if (state.me?.profile?.onboardedAt == null && state.me?.profile != null) {
        Routes.HOME
    } else {
        Routes.HOME
    }

    fun onDestination(route: String, screenTitle: String, back: Boolean = false) {
        title = screenTitle
        showBack = back
        navController.navigate(route) {
            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
            launchSingleTop = true
            restoreState = true
        }
    }

    // The bar has to follow the *current* route, not just the last tap. Setting
    // it inside onDestination left it stale whenever you popped back — Home
    // would still be titled "Check-in". Re-derived from the back stack instead.
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    LaunchedEffect(currentRoute) {
        ROUTE_TITLES[currentRoute]?.let {
            title = it
            showBack = false
        }
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet(
                drawerContainerColor = Palette.Cream,
                drawerContentColor = Palette.Charcoal,
            ) {
                Column(Modifier.padding(20.dp)) {
                    // The web draws a swirl mark here, not a brain emoji.
                    Image(
                        painter = painterResource(R.drawable.logo),
                        contentDescription = null,
                        contentScale = ContentScale.Fit,
                        modifier = Modifier.size(38.dp),
                    )
                    Spacer(Modifier.height(6.dp))
                    Text("MindCircle", style = MaterialTheme.typography.titleLarge, color = Palette.Plum)
                    Text(
                        "A calmer, brighter you",
                        style = MaterialTheme.typography.bodySmall,
                        color = Palette.WarmGray,
                    )
                }
                HorizontalDivider(color = Palette.Border)

                // Current route drives the active pill, the way the web's
                // SideNav highlights the page you are already on.
                // currentBackStackEntryAsState (not the plain property) — otherwise the
                // highlight is computed once and never moves when you navigate.
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoot = navBackStackEntry
                    ?.destination?.route?.substringBefore('/')

                Column(Modifier.weight(1f).verticalScroll(rememberScrollState())) {
                    drawerItems.forEach { item ->
                        val selected = currentRoot == item.route.substringBefore('/')
                        DrawerRow(
                            label = item.label,
                            icon = item.icon,
                            selected = selected,
                            onClick = {
                                scope.launch { drawerState.close() }
                                onDestination(item.route, item.label)
                            },
                        )
                    }

                    Spacer(Modifier.height(10.dp))
                    Text(
                        "SUPPORT",
                        style = MaterialTheme.typography.labelSmall,
                        color = Palette.WarmGray,
                        modifier = Modifier.padding(start = 16.dp, bottom = 4.dp),
                    )
                    supportItems.forEach { item ->
                        DrawerRow(
                            label = item.label,
                            icon = item.icon,
                            selected = false,
                            onClick = { scope.launch { drawerState.close() } },
                        )
                    }
                }

                // Profile card, as on the web: initials, name, role, sign out.
                val me = viewModel.me
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 10.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(Palette.White)
                        .border(1.dp, Palette.Border, RoundedCornerShape(20.dp))
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.horizontalGradient(
                                    listOf(Palette.Plum, Palette.Terracotta),
                                ),
                            ),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            (me?.profile?.displayName ?: me?.user?.fullName ?: "D")
                                .trim()
                                .take(1)
                                .uppercase(),
                            style = MaterialTheme.typography.titleSmall,
                            color = Color.White,
                        )
                    }
                    Spacer(Modifier.width(10.dp))
                    Column(Modifier.weight(1f)) {
                        Text(
                            me?.profile?.displayName ?: me?.user?.fullName ?: "Member",
                            style = MaterialTheme.typography.titleSmall,
                            color = Palette.Charcoal,
                            maxLines = 1,
                        )
                        Text(
                            "Member",
                            style = MaterialTheme.typography.labelSmall,
                            color = Palette.WarmGray,
                        )
                    }
                    Icon(
                        painter = painterResource(R.drawable.ic_signout),
                        contentDescription = "Sign out",
                        tint = Palette.Plum,
                        modifier = Modifier
                            .size(20.dp)
                            .clickable {
                                scope.launch { drawerState.close() }
                                viewModel.signOut()
                            },
                    )
                }
            }
        },
    ) {
        Scaffold(
            containerColor = Palette.Cream,
            topBar = {
                androidx.compose.material3.TopAppBar(
                    title = {
                        Text(
                            title,
                            style = MaterialTheme.typography.titleMedium,
                            color = Palette.Charcoal,
                            maxLines = 1,
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = {
                            if (showBack && navController.previousBackStackEntry != null) {
                                navController.popBackStack()
                            } else {
                                scope.launch { drawerState.open() }
                            }
                        }) {
                            Icon(
                                imageVector = if (showBack && navController.previousBackStackEntry != null) {
                                    Icons.Rounded.ArrowBack
                                } else {
                                    Icons.Filled.Menu
                                },
                                contentDescription = if (showBack) "Back" else "Open menu",
                                tint = Palette.Charcoal,
                            )
                        }
                    },
                    actions = {
                        IconButton(onClick = { onDestination(Routes.CRISIS, "Crisis Support") }) {
                            Icon(
                                Icons.Filled.Notifications,
                                contentDescription = "Crisis support",
                                tint = Palette.Plum,
                            )
                        }
                    },
                    colors = androidx.compose.material3.TopAppBarDefaults.topAppBarColors(
                        containerColor = Palette.Cream,
                    ),
                )
            },
            bottomBar = {
                BottomBar(
                    currentRoute = navController.currentBackStackEntry?.destination?.route,
                    onSelect = { item ->
                        onDestination(item.route, item.label)
                    },
                )
            },
        ) { padding ->
            NavHost(
                navController = navController,
                startDestination = startDestination,
                modifier = Modifier
                    .padding(padding)
                    .background(Palette.Cream),
            ) {
                composable(Routes.HOME) {
                    HomeScreen(
                        viewModel = viewModel,
                        onOpenJournal = { onDestination(Routes.JOURNAL, "Journal") },
                        onOpenInsights = { onDestination(Routes.INSIGHTS, "Insights") },
                        onOpenCrisis = { onDestination(Routes.CRISIS, "Crisis Support") },
                        onOpenAssessment = { onDestination(Routes.ASSESSMENT, "Check-in", back = true) },
                        onOpenActivities = { onDestination(Routes.ACTIVITIES, "Activities") },
                    )
                }
                composable(Routes.JOURNAL) {
                    JournalScreen(
                        onWrite = { onDestination(Routes.JOURNAL_WRITE, "Journal", back = true) },
                        onOpen = { id -> onDestination(Routes.entry(id), "Journal", back = true) },
                    )
                }
                composable(Routes.JOURNAL_WRITE) {
                    JournalWriteScreen(
                        onDone = { navController.popBackStack() },
                    )
                }
                composable(Routes.JOURNAL_ENTRY) { entry ->
                    JournalDetailScreen(
                        entryId = entry.arguments?.getString("id").orEmpty(),
                        onBack = { navController.popBackStack() },
                        onWrite = { onDestination(Routes.JOURNAL_WRITE, "Journal") },
                    )
                }
                composable(Routes.ASSESSMENT) {
                    AssessmentScreen(onDone = { navController.popBackStack() })
                }
                composable(Routes.CONNECT) {
                    ConnectScreen(
                        onOpenRoom = { id -> onDestination(Routes.room(id), "Chat", back = true) },
                        onOpenDm = { id -> onDestination(Routes.dm(id), "Chat", back = true) },
                        myId = viewModel.me?.user?.id,
                    )
                }
                composable(Routes.DISCOVER) {
                    DiscoverScreen(
                        onOpenProfile = { /* phase 2 */ },
                        onOpenDm = { id -> onDestination(Routes.dm(id), "Chat", back = true) },
                    )
                }
                composable(Routes.CHATS) {
                    // Chats is direct messages only; rooms live under Connect.
                    ChatsScreen(
                        onOpenDm = { id -> onDestination(Routes.dm(id), "Chat", back = true) },
                        onNewChat = { onDestination(Routes.NEW_CHAT, "New chat", back = true) },
                        onOpenDiscover = { onDestination(Routes.DISCOVER, "Discover") },
                    )
                }
                composable(Routes.NEW_CHAT) {
                    NewChatScreen(
                        onOpenDm = { id -> onDestination(Routes.dm(id), "Chat", back = true) },
                        onOpenDiscover = { onDestination(Routes.DISCOVER, "Discover") },
                        onBack = { navController.popBackStack() },
                    )
                }
                composable(Routes.ROOM) { entry ->
                    RoomScreen(
                        roomId = entry.arguments?.getString("roomId").orEmpty(),
                        onBack = { navController.popBackStack() },
                    )
                }
                composable(Routes.DM) { entry ->
                    RoomScreen(
                        roomId = "",
                        peerId = entry.arguments?.getString("peerId").orEmpty(),
                        onBack = { navController.popBackStack() },
                    )
                }
                composable(Routes.INSIGHTS) { InsightsScreen() }
                composable(Routes.ACTIVITIES) {
                    ActivitiesScreen(
                        onOpenActivity = { activity ->
                            onDestination(Routes.activity(activity.id), activity.title, back = true)
                        },
                        onTakeAssessment = { onDestination(Routes.ASSESSMENT, "Check-in", back = true) },
                    )
                }
                composable(Routes.ACTIVITY_DETAIL) { entry ->
                    val id = entry.arguments?.getString("activityId").orEmpty()
                    val activity = ACTIVITIES.firstOrNull { it.id == id } ?: ACTIVITIES.first()
                    ActivityDetailScreen(
                        activity = activity,
                        onBack = { navController.popBackStack() },
                        onOpenJournal = { onDestination(Routes.JOURNAL_WRITE, "Journal", back = true) },
                    )
                }
                composable(Routes.COUNSELLORS) {
                    ShellPlaceholder(
                        title = "Counsellors",
                        body = "The counsellor directory is still to be ported — the web has it " +
                            "at /app/counsellors.",
                        onOpenChats = { onDestination(Routes.CRISIS, "Crisis Support") },
                    )
                }
                composable(Routes.SETTINGS) {
                    // The screen draws its own large "Settings" hero, so the app
                    // bar stays blank (see ROUTE_TITLES) — otherwise the word
                    // appears twice, once in the bar and once right under it.
                    SettingsScreen(
                        viewModel = viewModel,
                        onNavigate = { route ->
                            if (route == "onboarding") {
                                onDestination(Routes.ONBOARDING, "Profile setup", back = true)
                            } else {
                                onDestination(route, "", back = true)
                            }
                        },
                    )
                }
                composable(Routes.ONBOARDING) {
                    OnboardingScreen(
                        viewModel = viewModel,
                        onDone = {
                            // Finish belongs back on Settings. A plain pop
                            // would drop to whatever sits under the wizard --
                            // onDestination() pops to the graph start, so that
                            // is usually Home, not where the user came from.
                            // Navigate explicitly instead, popping the wizard
                            // itself off the stack.
                            navController.navigate(Routes.SETTINGS) {
                                popUpTo(Routes.ONBOARDING) { inclusive = true }
                                launchSingleTop = true
                            }
                        },
                    )
                }
                composable(Routes.EDIT_PROFILE) {
                    EditProfileScreen(
                        viewModel = viewModel,
                        onBack = { navController.popBackStack() },
                    )
                }
                composable(Routes.CHANGE_PASSWORD) {
                    ChangePasswordScreen(onBack = { navController.popBackStack() })
                }
                composable(Routes.HELP_FAQ) {
                    FaqScreen(onBack = { navController.popBackStack() })
                }
                composable(Routes.HELP_SUPPORT) {
                    SupportScreen(
                        viewModel = viewModel,
                        onBack = { navController.popBackStack() },
                    )
                }
                composable(Routes.HELP_ABOUT) {
                    AboutScreen(onBack = { navController.popBackStack() })
                }
                composable(Routes.CRISIS) { CrisisScreen() }
            }
        }
    }
}

@Composable
private fun DrawerRow(
    label: String,
    icon: Int,
    selected: Boolean,
    onClick: () -> Unit,
) {
    // Mirrors SideNav.tsx: a soft plum-tinted pill with the icon sitting in a
    // solid plum chip, plum semibold text, and a chevron. The pill is inset
    // from the drawer's right edge so it does not run edge to edge.
    Row(
        modifier = Modifier
            .fillMaxWidth(0.94f)
            .padding(horizontal = 12.dp, vertical = 1.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(if (selected) Palette.Plum.copy(alpha = 0.10f) else Color.Transparent)
            .clickable(onClick = onClick)
            .padding(end = 12.dp, top = 6.dp, bottom = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(if (selected) Palette.Plum else Color.Transparent),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                painter = painterResource(icon),
                contentDescription = null,
                tint = if (selected) Palette.Cream else Palette.Charcoal.copy(alpha = 0.8f),
                modifier = Modifier.size(18.dp),
            )
        }
        Spacer(Modifier.width(12.dp))
        Text(
            label,
            style = MaterialTheme.typography.bodyMedium.copy(
                fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Medium,
            ),
            color = if (selected) Palette.Plum else Palette.Charcoal.copy(alpha = 0.8f),
            maxLines = 1,
            modifier = Modifier.weight(1f),
        )
        if (selected) {
            Icon(
                painter = painterResource(R.drawable.ic_chevron),
                contentDescription = null,
                tint = Palette.Plum.copy(alpha = 0.6f),
                modifier = Modifier.size(16.dp),
            )
        }
    }
}

@Composable
private fun BottomBar(currentRoute: String?, onSelect: (BottomItem) -> Unit) {
    NavigationBar(containerColor = Palette.White) {
        bottomItems.forEach { item ->
            val selected = currentRoute?.startsWith(item.route.substringBefore('/')) == true
            NavigationBarItem(
                selected = selected,
                onClick = { onSelect(item) },
                icon = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            painter = painterResource(item.icon),
                            contentDescription = item.label,
                            modifier = Modifier.size(22.dp),
                        )
                        if (selected) {
                            Spacer(Modifier.height(2.dp))
                            Box(
                                Modifier
                                    .size(4.dp)
                                    .clip(CircleShape)
                                    .background(Palette.Plum),
                            )
                        }
                    }
                },
                label = {
                    Text(
                        item.label,
                        fontSize = 11.sp,
                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                        color = if (selected) Palette.Charcoal else Palette.WarmGrayLight,
                    )
                },
                colors = androidx.compose.material3.NavigationBarItemDefaults.colors(
                    indicatorColor = Palette.Plum.copy(alpha = 0.08f),
                    selectedIconColor = Palette.Plum,
                    unselectedIconColor = Palette.WarmGrayLight,
                    unselectedTextColor = Palette.WarmGrayLight,
                ),
            )
        }
    }
}
