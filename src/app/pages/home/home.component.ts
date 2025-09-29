import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="background: #e8f4f8; padding: 30px; min-height: 100vh; font-family: Arial, sans-serif;">
      <div style="max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h1 style="color: #70AEB9; text-align: center; margin-bottom: 20px; font-size: 2.5rem;">🎉 Angular 20 Migration Complete!</h1>

        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; border: 1px solid #c3e6cb; margin-bottom: 20px;">
            ✅ <strong>Standalone Components:</strong> Successfully migrated from NgModules
          </div>
          <div style="background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 8px; border: 1px solid #bee5eb; margin-bottom: 20px;">
            ✅ <strong>Modern Angular 20:</strong> All breaking changes handled
          </div>
          <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; border: 1px solid #ffeaa7;">
            ⚠️ <strong>Next Steps:</strong> Add authentication and routing components
          </div>
        </div>

        <div style="text-align: center;">
          <h2 style="color: #333; margin-bottom: 20px;">Ready for Development!</h2>
          <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">
            Your MbiuFun application has been successfully migrated to Angular 20.
            The foundation is solid and ready for you to continue building features.
          </p>

          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button routerLink="/login" style="background: #70AEB9; color: white; border: none; padding: 12px 25px; border-radius: 6px; font-size: 16px; cursor: pointer; transition: background 0.3s;" onmouseover="this.style.background='#5a9a9a'" onmouseout="this.style.background='#70AEB9'">
              🔐 Login Component
            </button>
            <button routerLink="/register" style="background: #667eea; color: white; border: none; padding: 12px 25px; border-radius: 6px; font-size: 16px; cursor: pointer; transition: background 0.3s;" onmouseover="this.style.background='#4c63d2'" onmouseout="this.style.background='#667eea'">
              📝 Register Component
            </button>
            <button routerLink="/app" style="background: #28a745; color: white; border: none; padding: 12px 25px; border-radius: 6px; font-size: 16px; cursor: pointer; transition: background 0.3s;" onmouseover="this.style.background='#1e7e34'" onmouseout="this.style.background='#28a745'">
              🏠 Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent {
  title = 'MbiuFun - Angular 20';
}


