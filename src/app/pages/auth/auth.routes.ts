import { Routes } from "@angular/router";
import { AuthLayoutComponent } from "./auth-layout/auth-layout.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { ResetPasswordComponent } from "./reset-password/reset-password/reset-password.component";
import { RequestPasswordResetComponent } from "./reset-password/request-password-reset/request-password-reset.component";

export const authRoutes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            {path: 'login', component: LoginComponent},
            {path: 'register', component: RegisterComponent},
            {path: 'forgot-password', component: RequestPasswordResetComponent},
            // El token llega en el fragmento (#token=…), nunca en la ruta.
            {path: 'reset-password', component: ResetPasswordComponent}
        ]
    }
];